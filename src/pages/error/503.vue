<template>
  <div class="error-page">
    <div class="error-page__hero">
      <img class="error-page__img" src="~/assets/img/503.svg" alt="" />
      <div class="error-page__heading">{{ $t('errorPage.updating') }}</div>
      <div class="error-page__info">{{ $t('errorPage.backLater') }}</div>
    </div>
    <div class="error-page__message">{{ $t('errorPage.maintenance') }}</div>
  </div>
</template>

<style lang="scss">
:root {
  --fz-error-heading: var(--fz-h1);

  @media (min-width: 1200px) {
    --fz-error-heading: 36px;
  }
}

.error-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.error-page__hero {
  margin: auto;
  text-align: center;
  padding: 20px;

  @media (min-width: 1200px) {
    padding: 20px 50px;
  }
}

.error-page__img {
  display: block;
  margin: 0 auto;
  max-width: 240px;
  height: auto;

  @media (min-width: 1200px) {
    max-width: 100%;
  }
}

.error-page__heading {
  font-weight: 500;
  font-size: var(--fz-error-heading);
  text-transform: uppercase;
}

.error-page__info {
  font-weight: 500;
  font-size: var(--fz-h3);
  text-transform: uppercase;
  color: var(--c-gray-20);
  margin-top: 16px;
}

.error-page__message {
  background-color: var(--c-primary);
  color: var(--c-white);
  text-align: center;
  font-size: var(--fz-h3);
  padding: 20px;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  @media (min-width: 1200px) {
    padding: 20px 50px;
  }
}
</style>
