import { useState, useEffect } from 'react';
import { Linking, Alert, Platform } from 'react-native';

interface Browser {
  name: string;
  packageName: string;
  icon: string;
}

interface UseLinkingReturn {
  openURL: (url: string, title?: string) => Promise<void>;
  openWithBrowserChoice: (url: string, title?: string) => Promise<void>;
  isLoading: boolean;
  loadingUrl: string | null;
}

// 常见浏览器列表（带图标） - 包含多个可能的包名
const COMMON_BROWSERS: Browser[] = [
  {
    name: 'Chrome',
    packageName: 'com.android.chrome', // 标准Chrome
    icon: '🌐',
  },
  {
    name: 'Chrome (Google)',
    packageName: 'com.chrome.beta', // Chrome Beta
    icon: '🌐',
  },
  {
    name: 'Chrome (Stable)',
    packageName: 'com.google.android.apps.chrome', // Google Chrome
    icon: '🌐',
  },
  {
    name: 'Firefox',
    packageName: 'org.mozilla.firefox',
    icon: '🦊',
  },
  {
    name: 'Microsoft Edge',
    packageName: 'com.microsoft.emmx',
    icon: '🔷',
  },
  {
    name: '小米浏览器',
    packageName: 'com.mi.globalbrowser',
    icon: '📱',
  },
  {
    name: '小米浏览器(Mini)',
    packageName: 'com.mi.globalbrowser.mini',
    icon: '📱',
  },
  {
    name: '小米浏览器(国际版)',
    packageName: 'com.xiaomi.browser',
    icon: '📱',
  },
  {
    name: 'UC浏览器',
    packageName: 'com.UCMobile.intl',
    icon: '🚀',
  },
  {
    name: 'UC浏览器(中文版)',
    packageName: 'com.uc.browser.en',
    icon: '🚀',
  },
  {
    name: 'QQ浏览器',
    packageName: 'com.tencent.mtt',
    icon: '🐧',
  },
  {
    name: 'Opera',
    packageName: 'com.opera.browser',
    icon: '🎭',
  },
  {
    name: 'Samsung Internet',
    packageName: 'com.sec.android.app.sbrowser',
    icon: '📱',
  },
];

export const useLinking = (): UseLinkingReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null);

  // 处理初始URL和深度链接
  useEffect(() => {
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('应用通过链接打开:', initialUrl);
        }
      } catch (error) {
        console.error('获取初始URL失败:', error);
      }
    };

    handleInitialURL();

    const subscription = Linking.addEventListener('url', (event) => {
      console.log('接收到新的URL:', event.url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // 检测浏览器是否安装
  const checkBrowserInstalled = async (packageName: string): Promise<boolean> => {
    try {
      // 方法1: 尝试创建Intent来检测应用是否真正安装
      const intentUrl = `intent://test#Intent;package=${packageName};end`;
      const canOpenIntent = await Linking.canOpenURL(intentUrl);
      console.log(`浏览器检测(Intent) ${packageName}:`, canOpenIntent);
      
      // 方法2: 使用market://协议作为备用检测
      const marketUrl = `market://details?id=${packageName}`;
      const canOpenMarket = await Linking.canOpenURL(marketUrl);
      console.log(`浏览器检测(Market) ${packageName}:`, canOpenMarket);
      
      // 对于某些特殊浏览器，使用自定义scheme检测
      let customSchemeCheck = false;
      if (packageName === 'com.android.chrome' || packageName.includes('chrome')) {
        const chromeScheme = 'googlechrome://';
        customSchemeCheck = await Linking.canOpenURL(chromeScheme);
        console.log(`Chrome自定义scheme检测:`, customSchemeCheck);
      }
      
      // 综合判断：Intent检测为主，自定义scheme作为补充
      const isInstalled = canOpenIntent || customSchemeCheck;
      console.log(`最终检测结果 ${packageName}:`, isInstalled);
      
      return isInstalled;
    } catch (error) {
      console.log(`检测浏览器 ${packageName} 失败:`, error);
      return false;
    }
  };

  // 获取可用的浏览器列表
  const getAvailableBrowsers = async (): Promise<Browser[]> => {
    console.log('开始检测可用浏览器...');
    const availableBrowsers: Browser[] = [];
    
    for (const browser of COMMON_BROWSERS) {
      console.log(`正在检测: ${browser.name} (${browser.packageName})`);
      const isInstalled = await checkBrowserInstalled(browser.packageName);
      if (isInstalled) {
        availableBrowsers.push(browser);
        console.log(`✅ 发现已安装浏览器: ${browser.name} (${browser.packageName})`);
      } else {
        console.log(`❌ 浏览器未安装: ${browser.name} (${browser.packageName})`);
      }
    }
    
    console.log(`总共发现 ${availableBrowsers.length} 个可用浏览器`);
    console.log('已安装的浏览器列表:', availableBrowsers.map(b => `${b.name} (${b.packageName})`));
    return availableBrowsers;
  };

  // 使用特定浏览器打开URL
  const openWithSpecificBrowser = async (url: string, browser: Browser): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        console.log(`开始尝试使用 ${browser.name} 打开:`, url);
        
        // 先检查应用是否安装
        const isInstalled = await checkBrowserInstalled(browser.packageName);
        if (!isInstalled) {
          console.log(`${browser.name} 未安装`);
          return false;
        }

        // 对于Chrome系列浏览器，不使用深度链接，直接使用系统默认方式
        if (browser.packageName.includes('chrome') || browser.packageName.includes('Chrome')) {
          console.log(`Chrome浏览器使用系统默认方式打开`);
          try {
            await Linking.openURL(url);
            console.log(`${browser.name} 系统方式打开成功`);
            return true;
          } catch (error) {
            console.log(`${browser.name} 系统方式失败:`, error);
            return false;
          }
        }

        // 其他浏览器也使用系统默认方式
        try {
          console.log(`${browser.name} 使用系统默认方式打开`);
          await Linking.openURL(url);
          console.log(`${browser.name} 系统方式成功`);
          return true;
        } catch (error) {
          console.log(`${browser.name} 系统方式失败:`, error);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.log(`使用 ${browser.name} 打开失败:`, error);
      return false;
    }
  };

  // 显示浏览器选择器
  const showBrowserChooser = async (url: string, title: string): Promise<void> => {
    try {
      console.log('显示浏览器选择器 for:', url);
      
      // 检测可用的浏览器
      const availableBrowsers = await getAvailableBrowsers();
      
      if (availableBrowsers.length === 0) {
        console.log('没有检测到可用的浏览器，使用系统默认');
        Alert.alert('提示', '没有检测到其他浏览器，将使用系统默认浏览器打开');
        await Linking.openURL(url);
        return;
      }

      // 过滤重复的Chrome浏览器，只保留一个主要的Chrome
      const filteredBrowsers = availableBrowsers.filter((browser, index, arr) => {
        // 只对Chrome系列浏览器进行过滤
        if (browser.packageName.includes('chrome') && browser.packageName !== 'com.mi.globalbrowser' && browser.packageName !== 'com.xiaomi.browser') {
          // 优先保留标准Chrome，如果没有则保留第一个Chrome变体
          const chromeIndex = arr.findIndex(b => b.packageName === 'com.android.chrome');
          if (chromeIndex !== -1) {
            return browser.packageName === 'com.android.chrome';
          } else {
            // 如果没有标准Chrome，保留第一个Chrome变体
            const firstChromeIndex = arr.findIndex(b => 
              b.packageName.includes('chrome') && 
              b.packageName !== 'com.mi.globalbrowser' && 
              b.packageName !== 'com.xiaomi.browser'
            );
            return index === firstChromeIndex;
          }
        }
        // 非Chrome浏览器（包括小米浏览器）都保留
        return true;
      });

      console.log(`过滤后剩余 ${filteredBrowsers.length} 个浏览器`);

      // 限制显示的浏览器数量，Alert最多只能显示几个按钮
      const maxBrowsers = 6; // Alert对话框的按钮限制
      const displayBrowsers = filteredBrowsers.slice(0, maxBrowsers);
      
      if (filteredBrowsers.length > maxBrowsers) {
        console.log(`只显示前 ${maxBrowsers} 个浏览器，共检测到 ${filteredBrowsers.length} 个`);
      }

      // 创建浏览器选项
      const browserOptions = displayBrowsers.map(browser => ({
        text: `${browser.icon} ${browser.name}`,
        onPress: () => {
          console.log(`用户选择了 ${browser.name}`);
          openWithSpecificBrowser(url, browser).then(success => {
            if (!success) {
              console.log(`${browser.name} 打开失败，使用系统默认`);
              Alert.alert('提示', `${browser.name} 打开失败，将使用系统默认浏览器打开`);
              Linking.openURL(url);
            }
          });
        }
      }));

      // 添加系统默认选项到列表最前面
      browserOptions.unshift({
        text: '🌐 系统默认浏览器',
        onPress: () => {
          console.log('用户选择了系统默认浏览器');
          Linking.openURL(url).catch(error => {
            console.error('系统默认浏览器打开失败:', error);
            Alert.alert('错误', '无法打开链接，请检查网络连接或链接是否有效');
          });
        }
      });

      // 如果有更多浏览器，添加"查看更多"选项
      if (filteredBrowsers.length > maxBrowsers) {
        browserOptions.push({
          text: '📱 查看更多浏览器...',
          onPress: () => {
            console.log('用户选择查看更多浏览器');
            showMoreBrowsers(url, title, filteredBrowsers.slice(maxBrowsers));
          }
        });
      }

      // 显示选择对话框
      Alert.alert(
        '选择浏览器',
        `请选择用于打开 "${title}" 的浏览器：\n\n检测到 ${availableBrowsers.length} 个可用浏览器${filteredBrowsers.length > maxBrowsers ? `，显示前 ${maxBrowsers} 个` : ''}`,
        [
          ...browserOptions,
          {
            text: '取消',
            style: 'cancel',
            onPress: () => console.log('用户取消了操作')
          }
        ]
      );

    } catch (error) {
      console.error('显示浏览器选择器失败:', error);
      // 降级到系统默认方式
      Alert.alert('提示', '浏览器检测失败，将使用系统默认方式打开');
      await Linking.openURL(url);
    }
  };

  // 显示更多浏览器选项
  const showMoreBrowsers = async (url: string, title: string, moreBrowsers: Browser[]): Promise<void> => {
    try {
      console.log(`显示更多浏览器，共 ${moreBrowsers.length} 个`);
      
      const browserOptions = moreBrowsers.map(browser => ({
        text: `${browser.icon} ${browser.name}`,
        onPress: () => {
          console.log(`用户选择了 ${browser.name}`);
          openWithSpecificBrowser(url, browser).then(success => {
            if (!success) {
              console.log(`${browser.name} 打开失败，使用系统默认`);
              Alert.alert('提示', `${browser.name} 打开失败，将使用系统默认浏览器打开`);
              Linking.openURL(url);
            }
          });
        }
      }));

      Alert.alert(
        '更多浏览器',
        `选择其他浏览器打开 "${title}"：`,
        [
          ...browserOptions,
          {
            text: '返回',
            onPress: () => showBrowserChooser(url, title)
          },
          {
            text: '取消',
            style: 'cancel',
            onPress: () => console.log('用户取消了操作')
          }
        ]
      );
    } catch (error) {
      console.error('显示更多浏览器失败:', error);
      await Linking.openURL(url);
    }
  };

  // 带浏览器选择的打开URL函数
  const openWithBrowserChoice = async (url: string, title: string = '链接') => {
    try {
      setIsLoading(true);
      setLoadingUrl(url);
      
      console.log('开始处理链接:', { url, title });
      
      await showBrowserChooser(url, title);
      
    } catch (error) {
      console.error('处理链接失败:', error);
      
      Alert.alert(
        '错误',
        `处理链接时出现错误: ${error}`,
        [{ text: '确定' }]
      );
    } finally {
      setIsLoading(false);
      setLoadingUrl(null);
    }
  };

  // 直接打开URL函数
  const openURL = async (url: string, title: string = '链接') => {
    try {
      setIsLoading(true);
      setLoadingUrl(url);
      
      console.log('直接打开链接:', { url, title });
      
      const canOpen = await Linking.canOpenURL(url);
      console.log('canOpenURL结果:', canOpen);
      
      if (canOpen) {
        await Linking.openURL(url);
        console.log('URL打开成功');
      } else {
        // 尝试HTTP版本
        if (url.startsWith('https://')) {
          console.log('尝试HTTP版本');
          const httpUrl = url.replace('https://', 'http://');
          const httpCanOpen = await Linking.canOpenURL(httpUrl);
          
          if (httpCanOpen) {
            Alert.alert(
              '链接提醒',
              `将使用HTTP协议打开 "${title}"`,
              [
                { text: '取消', style: 'cancel' },
                { 
                  text: '继续', 
                  onPress: () => Linking.openURL(httpUrl)
                }
              ]
            );
          } else {
            throw new Error('HTTP版本也无法打开');
          }
        } else {
          throw new Error('URL不能被打开');
        }
      }
      
    } catch (error) {
      console.error('打开链接失败:', error);
      
      Alert.alert(
        '打开失败',
        `无法打开 "${title}"\n\n错误信息: ${error}`,
        [{ text: '确定' }]
      );
    } finally {
      setIsLoading(false);
      setLoadingUrl(null);
    }
  };

  return {
    openURL,
    openWithBrowserChoice,
    isLoading,
    loadingUrl,
  };
}; 