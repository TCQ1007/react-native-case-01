import { useState, useEffect } from 'react';
import { Linking, Alert, Platform } from 'react-native';

interface Browser {
  name: string;
  packageName: string;
  scheme: string;
}

interface UseLinkingReturn {
  openURL: (url: string, title?: string) => Promise<void>;
  openWithBrowserChoice: (url: string, title?: string) => Promise<void>;
  isLoading: boolean;
  loadingUrl: string | null;
}

// 常见浏览器列表
const COMMON_BROWSERS: Browser[] = [
  {
    name: 'Chrome',
    packageName: 'com.android.chrome',
    scheme: 'googlechrome',
  },
  {
    name: 'Firefox',
    packageName: 'org.mozilla.firefox',
    scheme: 'firefox',
  },
  {
    name: 'Edge',
    packageName: 'com.microsoft.emmx',
    scheme: 'microsoft-edge',
  },
  {
    name: '小米浏览器',
    packageName: 'com.mi.globalbrowser',
    scheme: 'mibrowser',
  },
  {
    name: 'UC浏览器',
    packageName: 'com.UCMobile.intl',
    scheme: 'ucbrowser',
  },
  {
    name: 'QQ浏览器',
    packageName: 'com.tencent.mtt',
    scheme: 'mttbrowser',
  },
  {
    name: 'Opera',
    packageName: 'com.opera.browser',
    scheme: 'opera',
  },
  {
    name: 'Samsung Internet',
    packageName: 'com.sec.android.app.sbrowser',
    scheme: 'samsungbrowser',
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

  // 检查特定浏览器是否可用
  const checkBrowserAvailability = async (browser: Browser, url: string): Promise<boolean> => {
    try {
      // 方法1: 尝试使用自定义scheme
      if (browser.scheme) {
        const customUrl = `${browser.scheme}://navigate?url=${encodeURIComponent(url)}`;
        const canOpenCustom = await Linking.canOpenURL(customUrl);
        if (canOpenCustom) return true;
      }

      // 方法2: 尝试使用包名的Intent格式
      if (Platform.OS === 'android') {
        const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=${browser.packageName};end`;
        const canOpenIntent = await Linking.canOpenURL(intentUrl);
        if (canOpenIntent) return true;
      }

      return false;
    } catch (error) {
      console.log(`检查浏览器 ${browser.name} 失败:`, error);
      return false;
    }
  };

  // 获取可用的浏览器列表
  const getAvailableBrowsers = async (url: string): Promise<Browser[]> => {
    const availableBrowsers: Browser[] = [];
    
    for (const browser of COMMON_BROWSERS) {
      const isAvailable = await checkBrowserAvailability(browser, url);
      if (isAvailable) {
        availableBrowsers.push(browser);
      }
    }

    return availableBrowsers;
  };

  // 使用特定浏览器打开URL
  const openWithSpecificBrowser = async (url: string, browser: Browser): Promise<boolean> => {
    try {
      // 方法1: 尝试使用自定义scheme
      if (browser.scheme) {
        const customUrl = `${browser.scheme}://navigate?url=${encodeURIComponent(url)}`;
        try {
          await Linking.openURL(customUrl);
          return true;
        } catch (error) {
          console.log(`使用 ${browser.name} 自定义scheme失败:`, error);
        }
      }

      // 方法2: 尝试使用Intent格式（Android）
      if (Platform.OS === 'android') {
        const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=${browser.packageName};end`;
        try {
          await Linking.openURL(intentUrl);
          return true;
        } catch (error) {
          console.log(`使用 ${browser.name} Intent失败:`, error);
        }
      }

      return false;
    } catch (error) {
      console.error(`打开 ${browser.name} 失败:`, error);
      return false;
    }
  };

  // 显示浏览器选择器
  const showBrowserChooser = async (url: string, title: string): Promise<void> => {
    try {
      const availableBrowsers = await getAvailableBrowsers(url);
      
      if (availableBrowsers.length === 0) {
        // 如果没有检测到特定浏览器，使用系统默认方式
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          throw new Error('没有找到可用的浏览器');
        }
        return;
      }

      if (availableBrowsers.length === 1) {
        // 如果只有一个浏览器，直接使用
        const success = await openWithSpecificBrowser(url, availableBrowsers[0]);
        if (!success) {
          // 如果失败，使用系统默认方式
          await Linking.openURL(url);
        }
        return;
      }

      // 如果有多个浏览器，显示选择器
      const browserOptions = availableBrowsers.map(browser => ({
        text: browser.name,
        onPress: () => {
          openWithSpecificBrowser(url, browser).then(success => {
            if (!success) {
              Alert.alert('错误', `无法使用 ${browser.name} 打开链接，将使用系统默认浏览器`);
              Linking.openURL(url);
            }
          });
        }
      }));

      // 添加系统默认选项
      browserOptions.push({
        text: '系统默认',
        onPress: () => Linking.openURL(url)
      });

      Alert.alert(
        '选择浏览器',
        `请选择用于打开 "${title}" 的浏览器：`,
        [
          ...browserOptions,
          {
            text: '取消',
            style: 'cancel'
          }
        ]
      );

    } catch (error) {
      console.error('显示浏览器选择器失败:', error);
      // 降级到系统默认方式
      await Linking.openURL(url);
    }
  };

  // 带浏览器选择的打开URL函数
  const openWithBrowserChoice = async (url: string, title: string = '链接') => {
    try {
      setIsLoading(true);
      setLoadingUrl(url);
      
      await showBrowserChooser(url, title);
      
    } catch (error) {
      console.error('打开链接失败:', error);
      
      Alert.alert(
        '打开失败',
        `无法打开 "${title}"\n\n可能的原因：\n• 没有安装合适的浏览器应用\n• 网络连接问题\n• 链接格式不正确`,
        [
          { text: '确定' },
          {
            text: '复制链接',
            onPress: () => {
              Alert.alert('链接地址', url, [{ text: '确定' }]);
            }
          }
        ]
      );
    } finally {
      setIsLoading(false);
      setLoadingUrl(null);
    }
  };

  // 原有的直接打开URL函数（保持向后兼容）
  const openURL = async (url: string, title: string = '链接') => {
    try {
      setIsLoading(true);
      setLoadingUrl(url);
      
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        if (url.startsWith('https://')) {
          const httpUrl = url.replace('https://', 'http://');
          const httpSupported = await Linking.canOpenURL(httpUrl);
          
          if (httpSupported) {
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
            throw new Error('设备不支持打开此类型的链接');
          }
        } else {
          throw new Error('设备不支持打开此链接');
        }
      }
      
    } catch (error) {
      console.error('打开链接失败:', error);
      
      Alert.alert(
        '打开失败',
        `无法打开 "${title}"\n\n可能的原因：\n• 没有安装合适的浏览器应用\n• 网络连接问题\n• 链接格式不正确`,
        [
          { text: '确定' },
          {
            text: '复制链接',
            onPress: () => {
              Alert.alert('链接地址', url, [{ text: '确定' }]);
            }
          }
        ]
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