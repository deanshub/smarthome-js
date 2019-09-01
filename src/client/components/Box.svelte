<script>
  import { onMount } from "svelte";
  import Icon from 'fa-svelte'
  import { faThermometerFull } from '@fortawesome/free-solid-svg-icons/faThermometerFull'
  import {selected} from '../stores'

  export let name;

  let icon = faThermometerFull;
  let img
  onMount(async ()=>{
    img= await import(`../assets/${name}.jpg`)
  })
  // let version = VERSION
</script>

<style>
  .box{
    flex: 4;
    background-size: cover;
    filter: grayscale(1);
    background-position: center;
    background-repeat: no-repeat;
    text-transform: capitalize;
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    background-color: #1c1c37;
    font-size: 7vmin;
    cursor: pointer;
    transition: all 400ms ease-in;
    min-width: 2.5em;
  }
  .box:hover{
    flex: 5;
    filter: grayscale(0);
  }
  .box.selected{
    flex: 100;
    filter: grayscale(0);
  }

  .name{
    text-orientation: mixed;
    writing-mode: vertical-rl;
    margin-bottom: 1em;
    margin-left: 0.5em;
  }
</style>

<div
  style="background-image: url({img});"
  class="box"
  class:selected={$selected===name}
  on:click={()=>$selected = $selected===name?undefined:name}
>
  <div class="name">{name}</div>
  <!-- <h1>Hello {name}!</h1>
  <div>Version: {version}</div>
  <div>Mode: {process.env.NODE_ENV}</div>-->
  <!-- <Icon icon={icon} /> -->
</div>
