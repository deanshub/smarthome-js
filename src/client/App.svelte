<script>
  import Box from './components/Box.svelte'
  let devices = [
    {name: 'bedroom'},
    {name:'livingroom'},
    {name:'workroom'}
  ]

</script>

<style>
  .app{
    height: 100vh;
    width: 100vw;
    display: flex;
    text-shadow: 1px 1px black;
  }
</style>

<div class="app">
  {#each devices as {name}}
    <Box name={name}/>
  {/each}
</div>
