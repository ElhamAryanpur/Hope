<style>
  .box {
    -webkit-transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
    transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  .box::after {
    content: '';
    border-radius: 5px;
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    opacity: 0;
    -webkit-transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
    transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  .box:hover {
    -webkit-transform: scale(1.08, 1.08);
    transform: scale(1.08, 1.08);
  }

  .box:hover::after {
    opacity: 1;
  }

  div {
    padding: 20px;
    background: #1a2835;
    border-radius: 10px;
    text-align: center;
    cursor: pointer;
    font-weight: bold;
  }
</style>

<div class="box">
  <slot/>
</div>
