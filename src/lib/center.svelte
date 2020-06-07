<script context="module">
  export function center(element) {
    element.setAttribute(
      "style",
      `left: ${window.innerWidth / 2 - element.clientWidth / 2}px;
      top: ${window.innerHeight / 2 - element.clientHeight / 2}px;`
    );

    window.addEventListener("resize", () => {
      element.setAttribute(
        "style",
        `left: ${window.innerWidth / 2 - element.clientWidth / 2}px;
      top: ${window.innerHeight / 2 - element.clientHeight / 2}px;`
      );
    });
  }
</script>
