<script>
  import { onMount } from 'svelte'
  import { selectedRoom } from '../stores'
  import CommandButton from './CommandButton.svelte'
  import {parseText} from './emojiToIcon'

  export let manifest
  $: name = parseText(manifest.displayName).clearedText.toLocaleLowerCase()
  $: active = $selectedRoom === name
  $: notActive = $selectedRoom !== name && $selectedRoom !== undefined
  $: commands = Object.keys(manifest.commands).filter(cmd=>!manifest.commands[cmd].disabled).map(cmd=>{
    return {propName: cmd, ...manifest.commands[cmd]}
  })

  let img
  onMount(async () => {
    img = await import(`../assets/${name}.jpg`)
  })

  // console.log(manifest)
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
  class:notSelected={notActive}
  on:click={() => ($selectedRoom = active ? undefined : name)}>
  {#if active}
    {#each commands as command}
      <CommandButton text={command.displayName} room={manifest.propName} command={command}/>
    {/each}
  {/if}
  <div class="name">{name}</div>
</div>
