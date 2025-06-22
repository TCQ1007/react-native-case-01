import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  useColorScheme,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
  const { openWithConfirmation } = useLinking();

  const handleLinkPress = (link: { title: string; url: string }) => {
    console.log('链接点击:', link.title, link.url);
    openWithConfirmation(link.url, link.title);
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
      shadowColor: '#000000',
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
    linkIcon: {
      fontSize: 24,
      marginRight: 15,
    },
    clickHint: {
      fontSize: 10,
      textAlign: 'center',
      color: isDarkMode ? '#666666' : '#cccccc',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={dynamicStyles.title}>🌐 链接测试</Text>
          <Text style={dynamicStyles.description}>
            点击链接使用默认浏览器打开
          </Text>
          <Text style={dynamicStyles.helpText}>
            💡 点击任意链接将弹出确认对话框
          </Text>
        </View>
        
        <View style={styles.linksContainer}>
          <Text style={dynamicStyles.linksTitle}>常用链接</Text>
          {Links.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={dynamicStyles.link}
              onPress={() => handleLinkPress(link)}
            >
              <View style={styles.linkContent}>
                <View style={styles.linkLeft}>
                  <Text style={dynamicStyles.linkIcon}>{link.icon}</Text>
                  <View style={styles.linkTextContainer}>
                    <Text style={dynamicStyles.linkTitle}>{link.title}</Text>
                    <Text style={dynamicStyles.linkDescription}>{link.description}</Text>
                  </View>
                </View>
                <View style={styles.linkRight}>
                  <Text style={dynamicStyles.clickHint}>
                    点击确认
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
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
  linkTextContainer: {
    flex: 1,
  },
});

export default HomeScreen; 