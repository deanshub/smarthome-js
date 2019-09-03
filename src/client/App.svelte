<script>
  import RoomSlide from './components/RoomSlide.svelte'
  let devices = [
    { name: 'bedroom' },
    { name: 'livingroom' },
    { name: 'workroom' },
  ]
</script>

<style>
  .app {
    height: 100vh;
    width: 100vw;
    display: flex;
    text-shadow: 1px 1px black;
  }
</style>

<div class="app">
  {#each devices as { name }}
    <RoomSlide {name} />
  {/each}
</div>
