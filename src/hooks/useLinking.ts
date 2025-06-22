import { useEffect } from 'react';
import { Linking, Alert } from 'react-native';

export interface LinkingHook {
  openWithConfirmation: (url: string, title?: string) => void;
}

export const useLinking = (): LinkingHook => {

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
  const openURL = async (url: string): Promise<void> => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        console.log('链接打开成功');
      } else {
        Alert.alert('错误', '无法打开链接，请检查网络连接');
      }
    } catch (error) {
      console.error('打开链接失败:', error);
      Alert.alert('错误', '无法打开链接，请检查网络连接');
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
          onPress: () => {
            console.log('用户确认打开链接');
            // 使用setTimeout确保Alert完全关闭后再执行操作
            setTimeout(() => {
              openURL(url);
            }, 100);
          },
        },
      ],
    );
  };

  return {
    openWithConfirmation,
  };
}; 