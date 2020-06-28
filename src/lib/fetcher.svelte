<script context="module">
  export function get(place, data = {}, callback) {
    window.socket.emit(place, data);
    window.socket.on(`${place} client`, callback);
  }

  export function send(place, data = {}) {
    window.socket.emit(place, data);
  }
</script>
