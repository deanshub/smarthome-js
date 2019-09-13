<script>
  import RoomSlide from './components/RoomSlide.svelte'
  import jwt from 'jsonwebtoken'
  let devices = [
    { name: 'bedroom' },
    { name: 'livingroom' },
    { name: 'workroom' },
  ]

  function connect() {
    const ws = new WebSocket('ws://'+INTERNAL_IP+':'+PORT)
    ws.onmessage = data => console.log(authenticate(data))
    // ws.onopen = async () => {
    //   resolve()
    //   ws.send(sign(await getManifest()))
    // }
    ws.onclose = ()=> console.error('connection closed')
    ws.onerror = console.error
  }

  function authenticate({data:message}) {
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
  {#each devices as { name }}
    <RoomSlide {name} />
  {/each}
  <div class="version">Version: {VERSION}</div>
  <!-- <div>Mode: {process.env.NODE_ENV}</div> -->
</div>
