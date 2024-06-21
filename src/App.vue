<template>
  <div id="app">
    <ChordDiagram></ChordDiagram>
  </div>
</template>

<script>
import ChordDiagram from './components/ChordDiagram.vue';

export default {
  name: 'App',
  components: {
    ChordDiagram
  }
};
</script>

<style>
#app{
  width: 100%;
  height: 100;
}
</style>
