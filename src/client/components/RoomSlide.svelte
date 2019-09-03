<script>
  import { onMount } from 'svelte'
  import { selected } from '../stores'
  import CommandButton from './CommandButton.svelte'

  export let name
  $: active = $selected === name

  let img
  onMount(async () => {
    img = await import(`../assets/${name}.jpg`)
  })
  // let version = VERSION
</script>

<style>
  .box {
    position: relative;
    flex: 4;
    min-width: 2.5em;

    background-size: cover;
    filter: grayscale(1);
    background-position: center;
    background-repeat: no-repeat;

    text-transform: capitalize;
    cursor: pointer;
    transition: all 400ms ease-in-out;

    padding: 0vmin 2vmin 2vmin 10vmin;

    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }
  .box:hover {
    flex: 5;
    filter: grayscale(0);
  }
  .box.selected {
    flex: 100;
    filter: grayscale(0);
  }
  .box.notSelected {
    flex: 4;
    padding: 6vmin;
  }

  .name {
    font-size: 7vmin;
    position: absolute;
    text-orientation: mixed;
    writing-mode: vertical-rl;
    bottom: 4vmin;
    left: 2vmin;
  }
</style>

<div
  style="background-image: url({img});"
  class="box"
  class:selected={active}
  class:notSelected={!active}
  on:click={() => ($selected = active ? undefined : name)}>
  {#if active}
    <CommandButton text="25°" />
    <CommandButton text="☀️ Hot" />
    <CommandButton text="❄️ Cold" />
    <CommandButton text="📺 TV" />
    <CommandButton text="💀 Off" />
    <CommandButton text="🌡 Temprature" />
    <CommandButton text="🎓 Learn" />
    <CommandButton text="🌅 TV&AC" />
    <CommandButton text="📽 Youtube" />
    <CommandButton text="🌐 Browser" />
    <CommandButton text="🔈 lower" />
    <CommandButton text="🔇 mute" />
    <CommandButton text="🔊 higher" />
    <CommandButton text="📸 picture" />
    <CommandButton text="🔒 lock" />
    <!-- <CommandButton text="👈 Back" /> -->
  {/if}
  <div class="name">{name}</div>
  <!-- <h1>Hello {name}!</h1>
  <div>Version: {version}</div>
  <div>Mode: {process.env.NODE_ENV}</div>-->
</div>
