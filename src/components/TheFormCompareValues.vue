<template>
<div class="compare-values-form__body">
    <div class="compare-values-form__header">
        <q-btn flat round dense icon="close" v-close-popup /> 
    </div>
    <div class="compare-values-form__content content-compare">
        <div class="content-compare__titles">
            <span class="content-compare__title">Прошлое значение</span>
            <span class="content-compare__title">Новое значение</span>
        </div>
        <CodeDiff
            class="compare-values-form__code-diff"
            :old-string="`${props.compareRow.oldValue}`"
            :new-string="`${props.compareRow.newValue}`"
            output-format="side-by-side"
            hideHeader="false"
        />
    </div>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, readonly, defineProps } from 'vue';
import { IStoryRow } from '../components/TheFormShowStoryRow.vue'
import { CodeDiff } from 'v-code-diff'

const props = defineProps<{
    compareRow: IStoryRow
}>()
</script>

<style>
.compare-values-form__body {
    font-family: Roboto400;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 60%;
    max-width: 80%;
    max-height: 80%;
    min-height: 500px;
    background-color: white;
}

.compare-values-form__header {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
}
.compare-values-form__code-diff {
    overflow: auto;
    height: 500px;
}

.compare-values-form__code-diff::-webkit-scrollbar {
    width: 8px !important;
}
.compare-values-form__code-diff::-webkit-scrollbar-corner {
background: #def1ee !important;
}
.compare-values-form__code-diff::-webkit-scrollbar-thumb {
    border-radius: 0px !important;
    background-color: #bcd7d2 !important;    /* цвет плашки */
    border: 1px solid #def1ee !important;  /* padding вокруг плашки */
}

.content-compare__title {
  font-weight: bold;
  font-size: 18px;
}

.content-compare__content {
    height: 500px;
    border: 1px solid var(--table-grey-color);
    overflow: auto;
    padding: 5px;
}

.content-compare__titles {
    display: grid;
    grid-template-columns: 50% 50%;
}

</style>