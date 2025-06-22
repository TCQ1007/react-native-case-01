import { useState, useEffect } from 'react';
import { Linking, Alert } from 'react-native';

interface UseLinkingReturn {
  openURL: (url: string, title?: string) => Promise<void>;
  isLoading: boolean;
  loadingUrl: string | null;
}

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
          // 可以在这里处理深度链接逻辑
        }
      } catch (error) {
        console.error('获取初始URL失败:', error);
      }
    };

    handleInitialURL();

    // 监听URL变化（用于深度链接）
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('接收到新的URL:', event.url);
      // 可以在这里处理运行时的深度链接
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const openURL = async (url: string, title: string = '链接') => {
    try {
      setIsLoading(true);
      setLoadingUrl(url);
      
      // 检查URL是否可以打开
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        // 直接使用Linking打开URL
        await Linking.openURL(url);
      } else {
        // 如果HTTPS不支持，尝试HTTP
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
              // 在实际项目中可以使用Clipboard API
              Alert.alert('链接地址', url, [
                { text: '确定' }
              ]);
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
    isLoading,
    loadingUrl,
  };
}; 