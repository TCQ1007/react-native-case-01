import { useState, useEffect } from 'react';
import { Linking, Alert } from 'react-native';

export interface LinkingHook {
  isLoading: boolean;
  openWithConfirmation: (url: string, title?: string) => void;
}

export const useLinking = (): LinkingHook => {
  const [isLoading, setIsLoading] = useState(false);

  // 监听深度链接
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('收到深度链接:', url);
    };

    // 获取初始URL（应用冷启动时）
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // 监听URL变化（应用热启动时）
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription?.remove();
  }, []);

  // 直接打开URL的函数
  const openURL = async (url: string): Promise<boolean> => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        Alert.alert('错误', '无法打开链接，请检查网络连接');
        return false;
      }
    } catch (error) {
      console.error('打开链接失败:', error);
      Alert.alert('错误', '无法打开链接，请检查网络连接');
      return false;
    }
  };

  // 带确认对话框的打开URL函数
  const openWithConfirmation = (url: string, title: string = '链接') => {
    Alert.alert(
      '确认打开',
      `是否要在浏览器中打开 "${title}"？`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定',
          onPress: async () => {
            console.log('用户确认打开链接');
            setIsLoading(true);
            
            try {
              const success = await openURL(url);
              if (success) {
                console.log('链接打开成功');
              }
            } catch (error) {
              console.error('处理链接时出现问题:', error);
              Alert.alert('错误', '处理链接时出现问题');
            } finally {
              // 立即关闭loading状态，避免残影
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  return {
    isLoading,
    openWithConfirmation,
  };
}; 