<script>
  import jwt from 'jsonwebtoken'
  import { allManifests } from './stores'
  import RoomSlide from './components/RoomSlide.svelte'
  import Loader from './components/Loader.svelte'

  function connect() {
    const ws = new WebSocket('ws://'+INTERNAL_IP+':'+PORT)
    ws.onmessage = ({data}) => handleMessage(ws, data)
    ws.onopen = async () => {
      ws.send(sign(requestManifests()))
    }
    ws.onclose = ()=> console.error('connection closed')
    ws.onerror = console.error
  }

  function requestManifests() {
    return {
      requestManifests: true,
    }
  }

  function handleMessage(ws, data) {
    const message = authenticate(data)
    if (message.allManifests) {
      $allManifests = message.allManifests
    }
  }

  function sign(message) {
    if (SECRET) {
      return jwt.sign(message, SECRET)
    }
    console.warn(
      'No secret key provided, all communtication will be un-encrypted!'
    )
    return JSON.stringify(message)
  }
  function authenticate(message) {
    if (SECRET) {
      try {
        return jwt.verify(message, SECRET)
      } catch (e) {
        console.error(
          `received message:
  ${message}
  But coudn't decrypt it with my secret key`
        )
        return null
      }
    }
    console.warn(
      'No secret key provided, all communtication will be un-encrypted!'
    )
    return JSON.parse(message)
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
