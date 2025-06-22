import { useState, useEffect } from 'react';
import { Linking, Alert } from 'react-native';

interface UseLinkingReturn {
  openURL: (url: string, title?: string) => Promise<void>;
  openWithBrowserChoice: (url: string, title?: string) => Promise<void>;
  isLoading: boolean;
  loadingUrl: string | null;
}

export const useLinking = (): UseLinkingReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null);

  // 处理深度链接
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

    return () => subscription?.remove();
  }, []);

  // 显示确认对话框
  const showConfirmDialog = (url: string, title: string): void => {
    Alert.alert(
      '打开链接',
      `即将使用默认浏览器打开：\n\n"${title}"\n\n${url}`,
      [
        {
          text: '取消',
          style: 'cancel',
          onPress: () => console.log('用户取消了操作')
        },
        {
          text: '确定',
          onPress: () => {
            console.log('用户确认打开链接');
            Linking.openURL(url).catch(error => {
              console.error('打开链接失败:', error);
              Alert.alert('错误', '无法打开链接，请检查网络连接');
            });
          }
        }
      ]
    );
  };

  // 带确认对话框的打开URL函数
  const openWithBrowserChoice = async (url: string, title: string = '链接') => {
    try {
      setIsLoading(true);
      setLoadingUrl(url);
      console.log('开始处理链接:', { url, title });
      showConfirmDialog(url, title);
    } catch (error) {
      console.error('处理链接失败:', error);
      Alert.alert('错误', '处理链接时出现问题');
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
      if (canOpen) {
        await Linking.openURL(url);
        console.log('URL打开成功');
      } else {
        throw new Error('URL无法打开');
      }
    } catch (error) {
      console.error('打开链接失败:', error);
      Alert.alert('打开失败', `无法打开 "${title}"`);
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