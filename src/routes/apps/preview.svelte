<script>
  export let file;
</script>

<div class="preview">
  <div
    class="image-container"
    style:background-image="{`url(${file.url})`}"
  ></div>
  <div class="image-label">
    <p>
      {file.displayName}
    </p>
  </div>
</div>

<style>
  .preview {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .image-container {
    width: 100%;
    flex: 5;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  .image-label {
    flex: 1;
    max-height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
