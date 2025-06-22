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
      // 使用market://协议检测应用是否安装
      const marketUrl = `market://details?id=${packageName}`;
      const canOpen = await Linking.canOpenURL(marketUrl);
      console.log(`浏览器检测 ${packageName}:`, canOpen);
      return canOpen;
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
      const isInstalled = await checkBrowserInstalled(browser.packageName);
      if (isInstalled) {
        availableBrowsers.push(browser);
        console.log(`发现已安装浏览器: ${browser.name} (${browser.packageName})`);
      }
    }
    
    console.log(`总共发现 ${availableBrowsers.length} 个可用浏览器`);
    return availableBrowsers;
  };

  // 使用特定浏览器打开URL
  const openWithSpecificBrowser = async (url: string, browser: Browser): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        console.log(`开始尝试使用 ${browser.name} 打开:`, url);
        
        // 方法1: 最简单的方式 - 直接尝试启动应用并传递URL
        try {
          // 先检查应用是否安装
          const isInstalled = await checkBrowserInstalled(browser.packageName);
          if (!isInstalled) {
            console.log(`${browser.name} 未安装`);
            return false;
          }

          // 对于Chrome系列浏览器，使用特殊处理
          if (browser.packageName.includes('chrome') || browser.packageName.includes('Chrome')) {
            // 尝试使用Chrome的深度链接
            try {
              const chromeUrl = `googlechrome://navigate?url=${encodeURIComponent(url)}`;
              console.log(`尝试使用Chrome深度链接:`, chromeUrl);
              await Linking.openURL(chromeUrl);
              console.log(`${browser.name} 深度链接成功`);
              return true;
            } catch (error) {
              console.log(`${browser.name} 深度链接失败:`, error);
            }
          }

          // 方法2: 使用标准方式打开，让系统选择器处理
          console.log(`尝试让系统处理URL并选择 ${browser.name}`);
          await Linking.openURL(url);
          console.log(`${browser.name} 系统方式成功`);
          return true;

        } catch (error) {
          console.log(`${browser.name} 所有方法都失败:`, error);
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

      // 创建浏览器选项
      const browserOptions = availableBrowsers.map(browser => ({
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

      // 显示选择对话框
      Alert.alert(
        '选择浏览器',
        `请选择用于打开 "${title}" 的浏览器：\n\n检测到 ${availableBrowsers.length} 个可用浏览器`,
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