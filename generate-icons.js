const fs = require('fs');
const path = require('path');

// Android图标尺寸配置
const androidSizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 }
];

// iOS图标尺寸配置
const iosSizes = [
  { name: 'Icon-20.png', size: 20 },
  { name: 'Icon-20@2x.png', size: 40 },
  { name: 'Icon-20@3x.png', size: 60 },
  { name: 'Icon-29.png', size: 29 },
  { name: 'Icon-29@2x.png', size: 58 },
  { name: 'Icon-29@3x.png', size: 87 },
  { name: 'Icon-40.png', size: 40 },
  { name: 'Icon-40@2x.png', size: 80 },
  { name: 'Icon-40@3x.png', size: 120 },
  { name: 'Icon-60@2x.png', size: 120 },
  { name: 'Icon-60@3x.png', size: 180 },
  { name: 'Icon-76.png', size: 76 },
  { name: 'Icon-76@2x.png', size: 152 },
  { name: 'Icon-83.5@2x.png', size: 167 },
  { name: 'Icon-1024.png', size: 1024 }
];

console.log('图标生成配置:');
console.log('Android图标尺寸:', androidSizes);
console.log('iOS图标尺寸:', iosSizes);

console.log('\n请手动完成以下步骤:');
console.log('1. 将icon.png调整为以下尺寸并放置到对应目录:');

console.log('\nAndroid图标:');
androidSizes.forEach(config => {
  console.log(`- ${config.size}x${config.size}px -> android/app/src/main/res/${config.folder}/ic_launcher.png`);
  console.log(`- ${config.size}x${config.size}px -> android/app/src/main/res/${config.folder}/ic_launcher_round.png`);
});

console.log('\niOS图标:');
iosSizes.forEach(config => {
  console.log(`- ${config.size}x${config.size}px -> ios/AwesomeProject/Images.xcassets/AppIcon.appiconset/${config.name}`);
});

console.log('\n或者使用在线工具:');
console.log('- https://appicon.co/ (推荐)');
console.log('- https://makeappicon.com/');
console.log('- https://icon.kitchen/'); 