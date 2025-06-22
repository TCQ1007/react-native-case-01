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

// 常见浏览器列表（带图标）
const COMMON_BROWSERS: Browser[] = [
  {
    name: 'Chrome',
    packageName: 'com.android.chrome',
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
    name: '小米浏览器(国际版)',
    packageName: 'com.mi.globalbrowser.mini',
    icon: '📱',
  },
  {
    name: 'UC浏览器',
    packageName: 'com.UCMobile.intl',
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

  // 使用特定浏览器打开URL
  const openWithSpecificBrowser = async (url: string, browser: Browser): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        // 特殊处理Chrome浏览器
        if (browser.packageName === 'com.android.chrome') {
          console.log(`开始尝试使用 Chrome 打开:`, url);
          
          // 方法1: 使用最简单的Intent格式（推荐）
          try {
            const simpleIntent = `intent:${url}#Intent;package=${browser.packageName};end`;
            console.log(`尝试使用 Chrome 打开 (简单Intent):`, simpleIntent);
            await Linking.openURL(simpleIntent);
            console.log(`Chrome 打开成功 (简单Intent)`);
            return true;
          } catch (error) {
            console.log(`Chrome 简单Intent失败:`, error);
          }

          // 方法2: 使用ACTION_VIEW Intent
          try {
            const actionViewIntent = `intent:${url}#Intent;action=android.intent.action.VIEW;package=${browser.packageName};end`;
            console.log(`尝试使用 Chrome 打开 (ACTION_VIEW):`, actionViewIntent);
            await Linking.openURL(actionViewIntent);
            console.log(`Chrome 打开成功 (ACTION_VIEW)`);
            return true;
          } catch (error) {
            console.log(`Chrome ACTION_VIEW失败:`, error);
          }

          // 方法3: 尝试启动Chrome然后再打开URL
          try {
            console.log(`尝试先启动 Chrome 应用`);
            // 检查Chrome是否安装
            const chromeAppIntent = `intent:#Intent;package=${browser.packageName};end`;
            await Linking.openURL(chromeAppIntent);
            
            // 等待一下然后打开URL
            setTimeout(async () => {
              try {
                console.log(`Chrome启动后尝试打开URL:`, url);
                await Linking.openURL(url);
                console.log(`Chrome启动后URL打开成功`);
              } catch (error) {
                console.log(`Chrome启动后URL打开失败:`, error);
              }
            }, 1500);
            
            console.log(`Chrome 启动成功，将在1.5秒后打开URL`);
            return true;
          } catch (error) {
            console.log(`Chrome 启动失败:`, error);
          }
        } else {
          // 其他浏览器使用标准Intent格式
          try {
            const standardIntent = `intent:${url}#Intent;package=${browser.packageName};end`;
            console.log(`尝试使用 ${browser.name} 打开 (标准Intent):`, standardIntent);
            await Linking.openURL(standardIntent);
            console.log(`${browser.name} 打开成功`);
            return true;
          } catch (error) {
            console.log(`${browser.name} 标准Intent失败:`, error);
          }

          // 备用方法：使用ACTION_VIEW
          try {
            const actionViewIntent = `intent:${url}#Intent;action=android.intent.action.VIEW;package=${browser.packageName};end`;
            console.log(`尝试使用 ${browser.name} 打开 (ACTION_VIEW):`, actionViewIntent);
            await Linking.openURL(actionViewIntent);
            console.log(`${browser.name} ACTION_VIEW成功`);
            return true;
          } catch (error) {
            console.log(`${browser.name} ACTION_VIEW失败:`, error);
          }
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
      
      // 直接创建浏览器选项，不进行预检测
      const browserOptions = COMMON_BROWSERS.map(browser => ({
        text: `${browser.icon} ${browser.name}`,
        onPress: () => {
          console.log(`用户选择了 ${browser.name}`);
          openWithSpecificBrowser(url, browser).then(success => {
            if (!success) {
              console.log(`${browser.name} 打开失败，使用系统默认`);
              Alert.alert('提示', `${browser.name} 可能未安装，将使用系统默认浏览器打开`);
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
        `请选择用于打开 "${title}" 的浏览器：`,
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