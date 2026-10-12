/* Shared, code-native line icons across student, hotel and operations screens. */
(function(root){'use strict';
  const paths={
    overview:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    students:'M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0M2 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 5 5',
    hotels:'M4 22V5h16v17M1 22h22M8 9h2m4 0h2M8 13h2m4 0h2M10 22v-5h4v5',
    jobs:'M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0m-1 5.5 4 4',
    applications:'M6 3h9l4 4v14H6zM14 3v5h5M10 12h5m-5 4h5',
    reviews:'M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 0 1-1-5 8 8 0 0 1 18 0ZM8 10h8m-8 4h5',
    contacts:'M3 5h18v14H3zM3 6l9 7 9-7',
    logs:'M5 3h14v18H5zM9 7h6M9 11h6M9 15h4',
    search:'M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0m-1 5.5 4 4',
    mail:'M3 5h18v14H3zM3 6l9 7 9-7',
    invite:'m3 11 18-8-8 18-3-8-7-2Zm7 2 11-10',
    book:'M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15',
    star:'m12 2 3.2 6.8L22 12l-6.8 3.2L12 22l-3.2-6.8L2 12l6.8-3.2Z'
  };
  function svg(name, className=''){
    const classes=String(className).replace(/[^a-zA-Z0-9_ -]/g,'');
    return `<svg class="ui-icon ${classes}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.star}"/></svg>`;
  }
  const api={svg};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else {root.JiulvIcons=api;document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-ui-icon]').forEach(node=>{node.outerHTML=svg(node.dataset.uiIcon);}));}
})(typeof window!=='undefined'?window:this);
