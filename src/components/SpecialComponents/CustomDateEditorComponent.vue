<template>
    <div class="q-pa-md">
        <div class="q-gutter-md row items-start">
        <q-date v-model="dateText" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
var today = new Date().toLocaleDateString().split('.').reverse().join('/')
let dateText = ref<string>(today)
</script>
