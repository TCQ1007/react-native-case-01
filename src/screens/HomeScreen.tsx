import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  useColorScheme,
  ScrollView,
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  Linking,
  Alert,
  NativeModules,
} from 'react-native';

// 获取原生模块
const { URLOpener } = NativeModules;

// 链接数据
const Links = [
  {
    title: '百度',
    description: '中文搜索引擎',
    url: 'https://www.baidu.com',
  },
  {
    title: 'Google',
    description: '国际搜索引擎',
    url: 'https://www.google.com',
  },
  {
    title: 'React Native 官网',
    description: 'React Native 官方文档',
    url: 'https://reactnative.dev',
  },
  {
    title: 'GitHub',
    description: '代码托管平台',
    url: 'https://github.com',
  },
];

function HomeScreen(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  // 打开链接函数
  const openLink = async (url: string, title: string) => {
    try {
      // 优先使用原生模块
      if (URLOpener) {
        try {
          await URLOpener.openURL(url);
          return;
        } catch (nativeError) {
          console.log('原生模块打开失败，尝试使用Linking');
        }
      }
      
      // 备选方案：使用React Native的Linking
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('错误', `无法打开链接: ${title}`);
      }
      
    } catch (error) {
      console.error('打开链接失败:', error);
      Alert.alert('错误', `打开 "${title}" 失败`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>欢迎使用 React Native!</Text>
          <Text style={styles.description}>
            点击下方链接测试浏览器打开功能
          </Text>
        </View>
        
        <View style={styles.linksContainer}>
          <Text style={styles.linksTitle}>常用链接</Text>
          {Links.map(({title, description, url}, index) => (
            <TouchableHighlight
              key={index}
              style={styles.link}
              onPress={() => openLink(url, title)}
              underlayColor="#f0f0f0">
              <View>
                <Text style={styles.linkTitle}>{title}</Text>
                <Text style={styles.linkDescription}>{description}</Text>
              </View>
            </TouchableHighlight>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  linksContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  linksTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  link: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen; 