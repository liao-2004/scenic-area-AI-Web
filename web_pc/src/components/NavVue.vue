<template>
  <div class="layout">
    <header class="nav">
      <div class="brand">
        <span class="brand-name">景区智能助手</span>
      </div>
      <nav class="navlist">
        <a href="#/wulian" class="nav-link">景区管理</a>
        <a href="#/aichat" class="nav-link">智能AI</a>
        <a href="#/publish" class="nav-link">发布文章</a>
      </nav>
    </header>
    <main class="content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'NavVue'
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background: #f5f7fa;
}
.nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 60px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  background: linear-gradient(90deg, #1f2a48 0%, #3a3f6b 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
}
.logo-icon {
  font-size: 24px;
  color: #6ea8fe;
}
.brand-name {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}
.navlist {
  display: flex;
  gap: 8px;
}
.nav-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 15px;
  transition: background 0.2s, color 0.2s;
}
.nav-link:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
.content {
  padding-top: 60px;
}
</style>
