// Shared shell for the recreated screens: writes the walkthrough's sidebar and top bar into
// <aside id="sidebar"> and <div id="topbar">. Edit here and every screen follows.
document.getElementById('sidebar').outerHTML = `<aside class="side">
    <div class="brand"><img class="logo" src="../../public/assets/showing-team/logo.svg" alt="Freshpaint"><span class="icon-box"><img src="../../public/assets/showing-team/nav-collapse.svg" width="18" height="18" alt=""></span></div>
    <div class="env-wrap"><div class="env"><img src="../../public/assets/showing-team/nav-env.svg" width="20" height="20" alt=""><span class="txt"><small>Main</small><b>Production</b></span><img class="rot" src="../../public/assets/showing-team/chevron-env.svg" width="20" height="20" alt=""></div></div>
    <div class="divider"></div>
    <div class="nav">
      <div class="cell"><div class="navrow"><span class="ic"><span class="ai"><img class="a" src="../../public/assets/showing-team/nav-ai.svg" alt=""><span class="m"><img src="../../public/assets/showing-team/nav-ai-spark.svg" alt=""></span></span></span><span class="label">Freshpaint AI</span><span style="padding-right:4px"><span class="badge-new">New</span></span></div></div>
      <div class="cell"><div class="navrow"><span class="ic"><img src="../../public/assets/showing-team/nav-sources.svg" width="20" height="20" alt=""></span><span class="label">Sources</span></div></div>
      <div class="cell"><div class="navrow"><span class="ic"><img src="../../public/assets/showing-team/nav-events.svg" width="20" height="20" alt=""></span><span class="label">Events</span><img src="../../public/assets/showing-team/chevron-down.svg" width="20" height="20" alt=""></div></div>
      <div class="cell"><div class="navrow"><span class="ic"><img src="../../public/assets/showing-team/nav-destinations.svg" width="20" height="20" alt=""></span><span class="label">Destinations</span><img src="../../public/assets/showing-team/chevron-down.svg" width="20" height="20" alt=""></div></div>
      <div class="cell"><div class="grp-head"><div class="navrow"><span class="ic"><img src="../../public/assets/showing-team/nav-insights.svg" width="20" height="20" alt=""></span><span class="label">Insights</span><img src="../../public/assets/showing-team/chevron-up.svg" width="20" height="20" alt=""></div></div><div class="grp-list"><div class="subcell"><div class="sub on">Attribution</div></div><div class="subcell"><div class="sub">Web Analytics<span class="badge-new">New</span></div></div><div class="subcell"><div class="sub">Funnels<span class="badge-new">New</span></div></div><div class="subcell"><div class="sub">Heatmaps<span class="badge-new">New</span></div></div><div class="subcell"><div class="sub">Session Replay<span class="badge-new">New</span></div></div><div class="subcell"><div class="sub">Surveys<span class="badge-new">New</span></div></div></div></div>
      <div class="cell"><div class="navrow"><span class="ic"><img src="../../public/assets/showing-team/nav-audiences.svg" width="20" height="20" alt=""></span><span class="label">Audiences</span><img src="../../public/assets/showing-team/chevron-down.svg" width="20" height="20" alt=""></div></div>
      <div class="cell"><div class="navrow"><span class="ic"><img src="../../public/assets/showing-team/nav-consent.svg" width="20" height="20" alt=""></span><span class="label">Consent</span><img src="../../public/assets/showing-team/chevron-down.svg" width="20" height="20" alt=""></div></div>
      <div class="cell"><div class="navrow"><span class="ic"><img src="../../public/assets/showing-team/nav-short-links.svg" width="20" height="20" alt=""></span><span class="label">Short Links</span><img src="../../public/assets/showing-team/chevron-down.svg" width="20" height="20" alt=""></div></div>
      <div class="cell"><div class="navrow"><span class="ic"><img src="../../public/assets/showing-team/nav-internal-tools.svg" width="20" height="20" alt=""></span><span class="label">Internal Tools</span><img src="../../public/assets/showing-team/chevron-down.svg" width="20" height="20" alt=""></div></div>
    </div>
  </aside>`
document.getElementById('topbar').outerHTML = `<div class="top">
      <span class="crumb">Attribution</span>
      <span class="tools">
        <span class="tool"><img src="../../public/assets/showing-team/bell.svg" alt=""><span class="badge">1</span></span>
        <span class="tool"><img src="../../public/assets/showing-team/help.svg" alt=""></span>
        <span class="tool"><span class="avatar">AN</span></span>
      </span>
    </div>`
