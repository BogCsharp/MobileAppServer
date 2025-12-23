import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  Linking,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

// Структура твоей документации на основе файлов
const DOCUMENTATION_SECTIONS = [
  {
    id: 'home',
    title: '🏠 Главная',
    url: 'https://bogcsharp.github.io/#/',
    type: 'web',
    description: 'Основная страница документации'
  },
  {
    id: 'register-screen',
    title: '📝 Экран регистрации',
    urls: [
      { type: 'md', url: 'https://raw.githubusercontent.com/bogcsharp/bogcsharp.github.io/main/screens/RegisterScreen.md' },
      { type: 'image', url: 'https://bogcsharp.github.io/Register.jpg', title: 'Скриншот' },
      { type: 'image', url: 'https://bogcsharp.github.io/RegisterError.jpg', title: 'Ошибка регистрации' }
    ]
  },
  {
    id: 'login-screen',
    title: '🔑 Экран входа',
    urls: [
      { type: 'image', url: 'https://bogcsharp.github.io/Login.jpg', title: 'Скриншот входа' },
      { type: 'image', url: 'https://bogcsharp.github.io/LoginError.jpg', title: 'Ошибка входа' }
    ]
  },
  {
    id: 'booking-screen',
    title: '📅 Экран бронирования',
    urls: [
      { type: 'md', url: 'https://raw.githubusercontent.com/bogcsharp/bogcsharp.github.io/main/screens/BookingScreen.md' },
      { type: 'image', url: 'https://bogcsharp.github.io/BookingL.jpg', title: 'Скриншот брони' },
      { type: 'image', url: 'https://bogcsharp.github.io/BookingSuccess.jpg', title: 'Успешное бронирование' }
    ]
  },
  {
    id: 'cart-screen',
    title: '🛒 Экран корзины',
    urls: [
      { type: 'md', url: 'https://raw.githubusercontent.com/bogcsharp/bogcsharp.github.io/main/screens/CartScreen.md' },
      { type: 'image', url: 'https://bogcsharp.github.io/Cart.jpg', title: 'Скриншот корзины' }
    ]
  },
  {
    id: 'profile-screen',
    title: '👤 Экран профиля',
    urls: [
      { type: 'md', url: 'https://raw.githubusercontent.com/bogcsharp/bogcsharp.github.io/main/screens/ProfileScreen.md' },
      { type: 'image', url: 'https://bogcsharp.github.io/Profile.jpg', title: 'Скриншот профиля' },
      { type: 'image', url: 'https://bogcsharp.github.io/AddCar.jpg', title: 'Добавление авто' },
      { type: 'image', url: 'https://bogcsharp.github.io/DeleteCarError.jpg', title: 'Ошибка удаления авто' }
    ]
  },
  {
    id: 'order-history',
    title: '📋 История заказов',
    urls: [
      { type: 'md', url: 'https://raw.githubusercontent.com/bogcsharp/bogcsharp.github.io/main/screens/OrderHistoryScreen.md' },
      { type: 'image', url: 'https://bogcsharp.github.io/OrderHistory.jpg', title: 'Скриншот истории' }
    ]
  },
  {
    id: 'home-screen',
    title: '📱 Главный экран',
    urls: [
      { type: 'md', url: 'https://raw.githubusercontent.com/bogcsharp/bogcsharp.github.io/main/screens/HomeScreen.md' },
      { type: 'image', url: 'https://bogcsharp.github.io/MainMenu.jpg', title: 'Главное меню' }
    ]
  },
  {
    id: 'guide-installation',
    title: '⚙️ Установка',
    urls: [
      { type: 'md', url: 'https://raw.githubusercontent.com/bogcsharp/bogcsharp.github.io/main/guide/installation.md' }
    ]
  },
  {
    id: 'guide-usage',
    title: '📖 Использование',
    urls: [
      { type: 'md', url: 'https://raw.githubusercontent.com/bogcsharp/bogcsharp.github.io/main/guide/usage.md' }
    ]
  }
];

export const DocumentationScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<any>(null);
  const [sectionContent, setSectionContent] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'content'>('list');
  const { width } = useWindowDimensions();

  // Загрузка контента для раздела
  const loadSectionContent = async (section: any) => {
    setLoading(true);
    setError(null);
    setActiveSection(section);
    setViewMode('content');

    try {
      if (section.type === 'web') {
        // Для веб-страниц парсим через fetch
        const response = await fetch(section.url);
        const html = await response.text();

        // Парсим HTML
        const content = parseHTMLContent(html);
        setSectionContent(content);
      } else if (section.urls) {
        // Для разделов с несколькими файлами
        let htmlContent = `<div style="padding: 20px;">`;
        htmlContent += `<h1>${section.title}</h1>`;

        // Загружаем все файлы раздела
        for (const item of section.urls) {
          if (item.type === 'md') {
            try {
              const response = await fetch(item.url);
              if (response.ok) {
                const mdContent = await response.text();
                htmlContent += convertMarkdownToHTML(mdContent);
              } else {
                htmlContent += `<p><em>Файл не найден: ${item.url}</em></p>`;
              }
            } catch (err) {
              htmlContent += `<p><em>Ошибка загрузки: ${item.url}</em></p>`;
            }
          } else if (item.type === 'image') {
            htmlContent += `
              <div style="margin: 20px 0;">
                <h3>${item.title || 'Изображение'}</h3>
                <p><a href="${item.url}" target="_blank">Открыть изображение</a></p>
              </div>
            `;
          }
        }

        htmlContent += `</div>`;
        setSectionContent(htmlContent);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки:', err);
      setError(`Ошибка: ${err.message}`);
      setSectionContent(`<div style="padding: 20px;"><h1>Ошибка</h1><p>Не удалось загрузить контент</p></div>`);
    } finally {
      setLoading(false);
    }
  };

  // Конвертация Markdown в HTML (упрощенная)
  const convertMarkdownToHTML = (markdown: string): string => {
    let html = markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');

    // Обертываем списки
    html = html.replace(/(<li>.*?<\/li>)/gims, '<ul>$1</ul>');

    return `<div style="margin: 15px 0;">${html}</div>`;
  };

  // Парсинг HTML контента
  const parseHTMLContent = (html: string): string => {
    // Упрощенный парсинг - извлекаем основной контент
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);

    let content = bodyMatch ? bodyMatch[1] : mainMatch ? mainMatch[1] : html;

    // Очищаем от скриптов и стилей
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    return `<div style="padding: 20px;">${content}</div>`;
  };

  // Открыть ссылку в браузере
  const openInBrowser = (url: string) => {
    Linking.openURL(url).catch(err =>
      console.error('Ошибка открытия ссылки:', err)
    );
  };

  // Рендер списка разделов
  const renderSectionItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.sectionItem}
      onPress={() => loadSectionContent(item)}
    >
      <Text style={styles.sectionTitle}>{item.title}</Text>
      <Text style={styles.sectionDescription}>
        {item.description || `${item.urls?.length || 0} файлов`}
      </Text>
      {item.url && (
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => openInBrowser(item.url)}
        >
          <Text style={styles.linkButtonText}>Открыть в браузере</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (viewMode === 'content' && (loading || sectionContent)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setViewMode('list')}
          >
            <Text style={styles.backButtonText}>← Назад к списку</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {activeSection?.title || 'Документация'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Загрузка контента...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadSectionContent(activeSection)}
            >
              <Text style={styles.retryButtonText}>Повторить</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.contentContainer}>
            <RenderHTML
              contentWidth={width - 40}
              source={{ html: sectionContent }}
              baseStyle={styles.htmlBaseStyle}
              tagsStyles={htmlStyles}
              onLinkPress={(event, href) => {
                openInBrowser(href);
                return false;
              }}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Документация DetailPro • Всего разделов: {DOCUMENTATION_SECTIONS.length}
              </Text>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  // Режим списка
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>📚 DetailPro Документация</Text>
        <Text style={styles.listSubtitle}>
          Полная документация по всем экранам приложения
        </Text>
        <Text style={styles.sectionCount}>
          Доступно разделов: {DOCUMENTATION_SECTIONS.length}
        </Text>
      </View>

      <FlatList
        data={DOCUMENTATION_SECTIONS}
        renderItem={renderSectionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listHeader: {
    padding: 20,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  listSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  sectionCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  listContainer: {
    padding: 16,
  },
  sectionItem: {
    backgroundColor: '#f8f9fa',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
  },
  linkButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  linkButtonText: {
    fontSize: 12,
    color: '#495057',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginRight: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#e9ecef',
  },
  backButtonText: {
    fontSize: 14,
    color: '#495057',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  htmlBaseStyle: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    padding: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
});

const htmlStyles = {
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 24,
    marginBottom: 16,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 12,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 10,
  },
  p: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 24,
  },
  ul: {
    marginBottom: 12,
    paddingLeft: 20,
  },
  li: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  a: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  img: {
    maxWidth: '100%',
    height: 'auto',
    marginVertical: 10,
  },
};