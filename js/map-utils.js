function mkObjs(pos, caps){
  var T=[['npc','lesson','246,201,79','📖',70],['mon','battle','226,96,79','⚔️',70],
         ['bush','gather','143,209,79','🧺',70],['craft','craft','255,166,90','🔥',68],
         ['shop','shop','180,150,255','🛒',68],['altar','altar','223,246,192','✨',92]];
  return T.map(function(t,i){
    return {id:t[0],type:t[1],c:t[2],icon:t[3],r:t[4],
            x:pos[i][0],y:pos[i][1],cap:caps[i][0],tip:caps[i][1]};
  });
}