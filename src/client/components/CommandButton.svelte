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

    background-color: rgba(0, 164, 255, 0.4);
    box-shadow: 1px 1px 3px black;
    border: 0;
    cursor: pointer;

    min-width: 10vmax;
    margin: 1em;
    flex: 1;
  }
  .commandButton:focus {
    outline: 0;
  }
  .commandButton:hover {
    background-color: rgba(7, 68, 156, 0.4);
  }

  .commandText {
    text-transform: capitalize;
    font-family: 'Open Sans', sans-serif;
    text-shadow: 1px 1px black;
    color: white;
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
