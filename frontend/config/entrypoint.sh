#!/bin/sh

cat <<EOF > /usr/share/nginx/html/config.js
window._env_ = {
  VITE_API_URL: "$VITE_API_URL",
  VITE_WS_URL: "$VITE_WS_URL",
};
EOF

exec "$@"