<script>
  import { fade } from 'svelte/transition'
  import Icon from 'fa-svelte'
  import { parseText } from './emojiToIcon'
  import { sendMessage } from '../stores'

  export let text
  export let room
  export let command

  const parsedText = parseText(text)
  $: clearedText = ` ${parsedText.clearedText}`
  $: icon = parsedText.icon

  function handleClick(e) {
    e.stopPropagation()
    sendMessage({data:{room, cmd: command.propName}})
  }
</script>

<style>
  .commandButton {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    height: 15vmin;
    border-radius: 10px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    backdrop-filter: contrast(40%) blur(1vmin) brightness(120%);
    color: white;
    box-shadow: 0 0px 8px rgba(138, 138, 138, 0.8);
    border: 0;
    cursor: pointer;

    min-width: 10vmax;
    max-width: 40vmin;
    margin: 1em;
    flex: 1;
  }
  .commandButton:focus {
    outline: 0;
  }
  .commandButton:hover {
    backdrop-filter: contrast(40%) blur(1vmin) brightness(150%);
    color: black;
  }

  .commandText {
    text-transform: capitalize;
    font-family: 'Open Sans', sans-serif;
    text-shadow: 1px 1px black;
    font-size: 2.8vmin;
  }

  .commandButton :global(.icon) {
    width: 4vmin;
    height: 4vmin;
  }
</style>

<div
  class="commandButton"
  in:fade={{ delay: 500, duration: 700 }}
  out:fade={{ duration: 300 }}
  on:click={handleClick}>
  {#if icon}
    <Icon class="icon" {icon} />
  {/if}
  <div class="commandText">{clearedText}</div>
</div>
