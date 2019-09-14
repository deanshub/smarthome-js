<script>
  import { fade } from 'svelte/transition'
  import Icon from 'fa-svelte'
  import { parseText } from './emojiToIcon'

  export let text
  const parsedText = parseText(text)
  $: clearedText = ` ${parsedText.clearedText}`
  $: icon = parsedText.icon

  function handleClick(e) {
    e.stopPropagation()
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

    background-color: rgba(255, 255, 255, 0.8);
    color: black;
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
    background-color: rgb(255, 255, 255);
  }

  .commandText {
    text-transform: capitalize;
    font-family: 'Open Sans', sans-serif;
    text-shadow: 1px 1px black;
    color: black;
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
