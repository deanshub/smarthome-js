<script>
  import { allManifests, selectedRoom, createConnection, onMessage } from './stores'
  import RoomSlide from './components/RoomSlide.svelte'
  import Loader from './components/Loader.svelte'
  import {onMount} from 'svelte'

  function connect() {
    createConnection('ws://'+INTERNAL_IP+':'+PORT)
    onMessage(handleMessage)
  }

  function handleMessage(ws, message) {
    if (message.allManifests) {
      $allManifests = message.allManifests
    }
  }

  const IDLE_TIMEOUT = 10000
  let deactivateTimout
  function reactivateTimeout() {
    if (deactivateTimout) {
      clearTimeout(deactivateTimout)
    }
    deactivateTimout = setTimeout(() => {
      $selectedRoom = undefined
    }, IDLE_TIMEOUT)
  }


  onMount(()=>{
    connect()
    if ('serviceWorker' in navigator) {
      // On load register the Worker and get the registration object
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(registration => {
            console.log('SW registered: ', registration)
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError)
          })
      })
    }
  })
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

<div class="app" on:mousemove={reactivateTimeout} on:click={reactivateTimeout}>
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
