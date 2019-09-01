<script>
  import Icon from 'fa-svelte'
  import { faThermometerFull } from '@fortawesome/free-solid-svg-icons/faThermometerFull'

	export let name;
  let version = VERSION
  let icon = faThermometerFull;
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>Hello {name}!</h1>
<div>Version: {version}</div>
<div>Mode: {process.env.NODE_ENV}</div>
<Icon icon={icon} />
