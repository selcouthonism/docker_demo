FROM busybox:latest
COPY --chmod=755 <<"EOF" /start.sh
echo "Starting..."
for i in $(seq 1 5); do
  echo "$i"
  sleep 1
done
echo "Exiting..."
exit 1
EOF
ENTRYPOINT /start.sh
