// Основной контент главной страницы

// Значения props:
// - activePage: string - текущая активная подстраница
// - onNavigate: callback - функция при смены подстраницы
export default function Home(props: {
  activePage: string;
  onNavigate: (page: number) => void;
  children: any;
}) {
  return (
    <div class="home-body">
      {/* Левая часть навигации */}
      <div class="home-page home-page--left">
        <div class="home-left-header">
          <div class="home-title font-hand">Мой Блокнотик</div>
        </div>

        <div class="home-nav">
          {/* Пример активной кнопки */}
          <button
            class="home-nav__item font-hand home-nav__item--active"
            onClick={() => props.onNavigate(1)}
          >
            <span class="home-nav__icon">🌺</span>
            <span class="home-nav__label">Главная</span>
            <span class="home-nav__bookmark" />
          </button>

          {/* Пример неактивной кнопки */}
          <button
            class="home-nav__item font-hand"
            onClick={() => props.onNavigate(2)}
          >
            <span class="home-nav__icon">😝</span>
            <span class="home-nav__label">Подтипная</span>
          </button>
        </div>
        {/* Вертикальный разделитель */}

        {/* Правая часть - контент */}
        <div class="home-page home-page--right">
          <div class="home-content">{props.children}</div>
        </div>
      </div>
    </div>
  );
}
