#!/usr/bin/env bash
#
# Installs Proton as a systemd system service.
#
# Run from a checkout, as root:
#
#     sudo ./deploy/install.sh
#
# Safe to re-run — that is also how you upgrade to a newer checkout. It never touches
# the database in /var/lib/proton or an existing /etc/proton/proton.env.
#
# NixOS users: this is the imperative path and will not survive a rebuild. Prefer a
# systemd.services.proton definition in your configuration.

set -euo pipefail

readonly SERVICE_NAME='proton'
readonly SERVICE_USER='proton'
readonly INSTALL_DIR='/opt/proton'
readonly CONFIG_DIR='/etc/proton'
readonly ENV_FILE="${CONFIG_DIR}/proton.env"
readonly UNIT_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
readonly STATE_DIR='/var/lib/proton'

# Everything copied into INSTALL_DIR. node_modules is rebuilt rather than copied, and
# .git, docs and tests are left behind.
readonly PAYLOAD=(src scripts package.json bun.lock tsconfig.json)

# Assigned separately from `readonly` so a failing `cd` is not masked by the declaration.
REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
readonly REPO_ROOT

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33mwarning:\033[0m %s\n' "$*" >&2; }
die() {
  printf '\033[1;31merror:\033[0m %s\n' "$*" >&2
  exit 1
}

# --- Preflight ---------------------------------------------------------------

[[ ${EUID} -eq 0 ]] || die "must run as root (try: sudo $0)"

command -v systemctl >/dev/null 2>&1 || die 'systemctl not found — this host does not use systemd'

BUN_BIN="$(command -v bun || true)"
[[ -n ${BUN_BIN} ]] || die 'bun not found on PATH. Install it from https://bun.sh first.'
info "using bun at ${BUN_BIN} ($("${BUN_BIN}" --version))"

for item in "${PAYLOAD[@]}"; do
  [[ -e "${REPO_ROOT}/${item}" ]] || die "missing ${item} in ${REPO_ROOT} — run this from a full checkout"
done

if [[ -e /etc/NIXOS ]]; then
  warn 'this host is NixOS: files written here will not survive a nixos-rebuild.'
  warn 'consider declaring systemd.services.proton in your configuration instead.'
fi

# --- Service account ---------------------------------------------------------

if id -u "${SERVICE_USER}" >/dev/null 2>&1; then
  info "service user '${SERVICE_USER}' already exists"
else
  info "creating system user '${SERVICE_USER}'"
  useradd --system --no-create-home --home-dir "${STATE_DIR}" \
    --shell /usr/sbin/nologin --comment 'Proton Discord bot' "${SERVICE_USER}"
fi

# --- Application files -------------------------------------------------------

# Guard the path before removing anything: INSTALL_DIR is a constant, but a typo in an
# edited copy of this script should not be able to wipe an arbitrary directory.
if [[ ${INSTALL_DIR} != /opt/* || ${#INSTALL_DIR} -lt 6 ]]; then
  die "refusing to operate on suspicious INSTALL_DIR '${INSTALL_DIR}'"
fi

info "installing application to ${INSTALL_DIR}"
mkdir -p "${INSTALL_DIR}"

# Drop previously installed payload so renamed or deleted files do not linger, then copy
# the current checkout over the top.
for item in "${PAYLOAD[@]}"; do
  rm -rf "${INSTALL_DIR:?}/${item}"
  cp -a "${REPO_ROOT}/${item}" "${INSTALL_DIR}/${item}"
done

info 'installing production dependencies'
(cd "${INSTALL_DIR}" && "${BUN_BIN}" install --frozen-lockfile --production)

# The service only needs to read its own code; root owns it so a compromised bot cannot
# rewrite its own source.
chown -R root:root "${INSTALL_DIR}"
chmod -R go-w "${INSTALL_DIR}"

# --- Configuration -----------------------------------------------------------

mkdir -p "${CONFIG_DIR}"
chown root:root "${CONFIG_DIR}"
chmod 0750 "${CONFIG_DIR}"

env_is_placeholder=0
if [[ -f ${ENV_FILE} ]]; then
  info "keeping existing ${ENV_FILE}"
else
  info "installing example environment file to ${ENV_FILE}"
  cp "${REPO_ROOT}/deploy/proton.env.example" "${ENV_FILE}"
  env_is_placeholder=1
fi
chown root:root "${ENV_FILE}"
chmod 0600 "${ENV_FILE}"

# A token line that is still empty means the operator has not filled the file in.
if grep -qE '^TOKEN=\s*$' "${ENV_FILE}"; then
  env_is_placeholder=1
fi

# --- Unit --------------------------------------------------------------------

info "installing unit to ${UNIT_FILE}"
# Substitute the bun path; '|' as the delimiter so a path containing '/' is fine.
sed "s|__BUN__|${BUN_BIN}|g" "${REPO_ROOT}/deploy/${SERVICE_NAME}.service" >"${UNIT_FILE}"
chown root:root "${UNIT_FILE}"
chmod 0644 "${UNIT_FILE}"

systemctl daemon-reload
systemctl enable "${SERVICE_NAME}.service" >/dev/null
info "enabled ${SERVICE_NAME}.service"

# --- Next steps --------------------------------------------------------------

echo
if [[ ${env_is_placeholder} -eq 1 ]]; then
  warn "${ENV_FILE} still needs real values — the service will fail to start without them."
  echo
  echo "  From a checkout with your secrets configured:"
  echo "    secretspec export --profile production --format dotenv | sudo tee ${ENV_FILE}"
  echo "    sudo chmod 600 ${ENV_FILE}"
  echo
  echo "  Register the slash commands (once, and again after any command changes):"
  echo "    secretspec run --profile production -- bun run deploy"
  echo
  echo "  Then start the service:"
  echo "    sudo systemctl start ${SERVICE_NAME}"
else
  if systemctl is-active --quiet "${SERVICE_NAME}.service"; then
    info "restarting ${SERVICE_NAME}"
    systemctl restart "${SERVICE_NAME}.service"
  else
    info "start it with: systemctl start ${SERVICE_NAME}"
  fi
fi

echo
echo "  Logs:    journalctl -u ${SERVICE_NAME} -f"
echo "  Status:  systemctl status ${SERVICE_NAME}"
echo "  Data:    ${STATE_DIR} (created by systemd on first start)"
echo
echo "  To import a pre-2.0 database, copy it to ${INSTALL_DIR}/database.legacy.sqlite"
echo "  before the first start; it is imported once and then left in place."
