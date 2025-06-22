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
  ActivityIndicator,
} from 'react-native';
import { useLinking } from '../hooks/useLinking';

// 链接数据
const Links = [
  {
    title: '百度',
    description: '中文搜索引擎',
    url: 'https://www.baidu.com',
    icon: '🔍',
  },
  {
    title: 'Google',
    description: '国际搜索引擎',
    url: 'https://www.google.com',
    icon: '🌐',
  },
  {
    title: 'React Native 官网',
    description: 'React Native 官方文档',
    url: 'https://reactnative.dev',
    icon: '⚛️',
  },
  {
    title: 'GitHub',
    description: '代码托管平台',
    url: 'https://github.com',
    icon: '🐙',
  },
  {
    title: '知乎',
    description: '中文问答社区',
    url: 'https://www.zhihu.com',
    icon: '💭',
  },
  {
    title: 'Stack Overflow',
    description: '程序员问答社区',
    url: 'https://stackoverflow.com',
    icon: '💻',
  },
];

function HomeScreen(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const { openWithBrowserChoice, loadingUrl } = useLinking();

  // 单击直接弹出浏览器选择菜单
  const handleLinkPress = (url: string, title: string) => {
    openWithBrowserChoice(url, title);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
      color: isDarkMode ? '#ffffff' : '#000000',
    },
    description: {
      fontSize: 16,
      color: isDarkMode ? '#cccccc' : '#666666',
      textAlign: 'center',
    },
    linksTitle: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 20,
      color: isDarkMode ? '#ffffff' : '#000000',
    },
    link: {
      backgroundColor: isDarkMode ? '#2a2a2a' : 'white',
      padding: 20,
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444444' : '#e0e0e0',
      shadowColor: isDarkMode ? '#000000' : '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    linkTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
      color: isDarkMode ? '#ffffff' : '#000000',
    },
    linkDescription: {
      fontSize: 14,
      color: isDarkMode ? '#cccccc' : '#666666',
    },
    helpText: {
      fontSize: 12,
      color: isDarkMode ? '#888888' : '#999999',
      textAlign: 'center',
      marginTop: 5,
      fontStyle: 'italic',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={dynamicStyles.title}>欢迎使用 React Native!</Text>
          <Text style={dynamicStyles.description}>
            点击链接选择浏览器打开
          </Text>
          <Text style={[dynamicStyles.description, { marginTop: 10, fontSize: 14 }]}>
            支持多浏览器选择功能
          </Text>
          <Text style={dynamicStyles.helpText}>
            💡 点击任意链接将弹出浏览器选择菜单
          </Text>
        </View>
        
        <View style={styles.linksContainer}>
          <Text style={dynamicStyles.linksTitle}>常用链接</Text>
          {Links.map(({title, description, url, icon}, index) => (
            <TouchableHighlight
              key={index}
              style={dynamicStyles.link}
              onPress={() => handleLinkPress(url, title)}
              underlayColor={isDarkMode ? "#333333" : "#f0f0f0"}
              disabled={loadingUrl === url}>
              <View style={styles.linkContent}>
                <View style={styles.linkLeft}>
                  <Text style={styles.linkIcon}>{icon}</Text>
                  <View style={styles.linkTextContainer}>
                    <Text style={dynamicStyles.linkTitle}>{title}</Text>
                    <Text style={dynamicStyles.linkDescription}>{description}</Text>
                  </View>
                </View>
                <View style={styles.linkRight}>
                  {loadingUrl === url ? (
                    <ActivityIndicator 
                      size="small" 
                      color={isDarkMode ? "#ffffff" : "#007bff"} 
                    />
                  ) : (
                    <Text style={[styles.clickHint, { color: isDarkMode ? '#666666' : '#cccccc' }]}>
                      点击选择
                    </Text>
                  )}
                </View>
              </View>
            </TouchableHighlight>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  linksContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkRight: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  linkIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  linkTextContainer: {
    flex: 1,
  },
  clickHint: {
    fontSize: 10,
    textAlign: 'center',
  },
});

export default HomeScreen; 