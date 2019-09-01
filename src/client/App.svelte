<script>
	export let name;
  let version = VERSION
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>Hello {name}!</h1>
<div>Version: {version}</div>
<div>Mode: {process.env.NODE_ENV}</div>
