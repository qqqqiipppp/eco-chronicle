
window.ECO_BOOT_READY=false;
window.ecoBootFailure=function(error){
  if(window.ECO_BOOT_READY)return;
  var status=document.getElementById('bootStatus'),help=document.getElementById('bootHelp');
  if(status)status.textContent='게임을 시작하지 못했어요.';
  if(help)help.hidden=false;
  console.error('[Boot]',error);
};
window.addEventListener('error',function(event){window.ecoBootFailure(event.error||event.message);});
window.addEventListener('unhandledrejection',function(event){window.ecoBootFailure(event.reason);});
window.setTimeout(function(){if(!window.ECO_BOOT_READY)window.ecoBootFailure('초기 로딩이 완료되지 않았습니다.');},15000);
