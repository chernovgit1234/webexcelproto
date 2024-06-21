<template>
    <div>
        <!-- <h1>{{ $t('column.name') }}</h1> -->
    </div>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { SUPPORT_LOCALES as supportLocales, setI18nLanguage } from '../i18n'
 const { locale } = useI18n({ useScope: 'global' }); 
watch(locale, (val) => {
  setI18nLanguage(val);
});
</script>

<style lang="css">

</style>
