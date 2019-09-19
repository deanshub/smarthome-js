<script>
  import { allManifests, ws, createConnection, onMessage } from './stores'
  import RoomSlide from './components/RoomSlide.svelte'
  import Loader from './components/Loader.svelte'

  function connect() {
    createConnection('ws://'+INTERNAL_IP+':'+PORT)
    onMessage(handleMessage)
  }

  function handleMessage(ws, message) {
    if (message.allManifests) {
      $allManifests = message.allManifests
    }
  }

  connect()
</script>

<style>
  .app {
    height: 100vh;
    width: 100vw;
    display: flex;
    text-shadow: 1px 1px black;
  }

  .version {
    position: absolute;
    right: 0;
    bottom: 0;
  }
</style>

<div class="app">
  {#if $allManifests!==undefined}
    {#each Object.keys($allManifests||{}).sort() as room}
      <RoomSlide manifest={$allManifests[room]} />
    {/each}
  {:else}
    <Loader/>
  {/if}
  <div class="version">Version: {VERSION}</div>
  <!-- <div>Mode: {process.env.NODE_ENV}</div> -->
</div>
