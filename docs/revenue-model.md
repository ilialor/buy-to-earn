# Модель распределения доходов Co-Intent 

## Введение

Модель распределения доходов Co-Intent обеспечивает справедливое и прозрачное распределение выручки от продаж токенов между всеми участниками экосистемы: создателями контента, держателями токенов, платформой и партнерами по продвижению.

Ключевой принцип: **справедливое распределение доходов на основе окупаемости вложений**, при котором приоритет получают те держатели токенов, которые еще не окупили свои вложения.

> **Примечание:** Подробные практические примеры работы механизма распределения доходов представлены в документе [Примеры работы системы приоритета неокупившихся токенов](payback-examples.md).

## Общий обзор

Модель распределения доходов Co-Intent направлена на справедливое вознаграждение всех участников: Создателя продукта, Платформы и Покупателей (держателей токенов/NFT), обеспечивая при этом устойчивость и предотвращая схемы Понци.

## Этап 1: Первоначальные инвестиции и Предоплата

1.  **Определение Суммы:** Устанавливается необходимая **Сумма начальных инвестиций** для создания продукта.
2.  **Расчет Кол-ва Заказчиков:** На основе **Цены токена** рассчитывается минимальное количество первых покупателей (Заказчиков), чьи взносы покроют эту сумму: `Кол-во Заказчиков = ОкруглениеВверх(Сумма начальных инвестиций / Цена токена)`.
3.  **Предоплата Создателю:** Вся **Сумма начальных инвестиций**, собранная от этих первых `Кол-ва Заказчиков`, **полностью передается Создателю** в качестве оплаты за разработку продукта. Выручка от этих первых продаж *не подлежит* дальнейшему распределению между участниками.

## Этап 2: Распределение дохода от последующих продаж

Каждая продажа продукта, начиная с `(Кол-во Заказчиков + 1)`-й, распределяется согласно настраиваемым долям:

| Участник        | Доля       | Описание                                                                                                |
|-----------------|------------|---------------------------------------------------------------------------------------------------------|
| **Создатель**   | Настраиваемая (по умолч. 10%) | Дополнительное вознаграждение сверх первоначальной предоплаты.                               |
| **Платформа**   | Настраиваемая (по умолч. 10%) | Комиссия за использование инфраструктуры, хостинг, маркетинг и управление.                              |
| **Продвижение** | Настраиваемая (по умолч. 10%) | Бюджет на маркетинг, партнерские программы и стимулирование продаж.                                       |
| **Покупатели**  | Остаток (100% - Сумма долей выше) | Основная часть дохода, распределяемая между *всеми предыдущими* держателями токенов/NFT (включая самых первых Заказчиков с #1 по #`Кол-во Заказчиков`) согласно правилам ниже. |
| **Итого**       | 100%       |                                                                                                         |

## Механизм распределения доли покупателей

Ключевой элемент модели — справедливое распределение доли покупателей между всеми держателями (начиная с токена #1), основанное на принципе окупаемости инвестиций. Первые Заказчики (токены #1 - #`Кол-во Заказчиков`) участвуют в этом распределении наравне со всеми остальными, получая доход от продаж, следующих за фазой предоплаты.

**Цель покупателя:** Вернуть первоначальные инвестиции (Цену токена) и получить определённый процент прибыли сверху (настраивается, по умолч. 100%, т.е. получить 2x от Цены токена).

**Принцип "Приоритета Не Окупившихся":**

1.  **Два пула покупателей:** На момент *каждой новой продажи* (начиная с `(Кол-во Заказчиков + 1)`-й), все *предыдущие* покупатели (токены с #1 по `номер_текущей_продажи - 1`) **точно** делятся на две группы на основе их **реально накопленного** дохода к этому моменту:
    *   **Не окупившиеся:** Те, кто еще не достиг цели (например, 2x от Цены токена).
    *   **Окупившиеся:** Те, кто уже достиг или превысил цель.
2.  **Распределение Доли Покупателей:** Доля покупателей (например, 70%) от *текущей новой продажи* делится между этими двумя пулами:
    *   **Большая часть (настраивается, % от доли покупателей)**: Распределяется пропорционально *только* среди **точно определенных не окупившихся** покупателей. Это ускоряет их выход на окупаемость и прибыль.
    *   **Меньшая часть (остаток от доли покупателей)**: Распределяется пропорционально среди **всех** *предыдущих* покупателей (включая уже окупившихся).
3.  **Динамика:** По мере накопления дохода от последующих продаж, покупатели **фактически** переходят из пула "не окупившихся" в пул "окупившихся". Преимущество ранних покупателей (Заказчиков) заключается в том, что они начинают этот процесс накопления раньше.

**Рекурсивная природа расчета:**

Расчет по своей природе является рекурсивным или итеративным. Доход токена `n` после продажи `k`, обозначаемый как \(E(n, k)\), зависит от его дохода после предыдущей продажи \(E(n, k-1)\) плюс прирост \(\Delta E(n, k)\), полученный от продажи `k`:

\[ E(n, k) = E(n, k-1) + \Delta E(n, k) \quad \text{для } n < k \]

Прирост \(\Delta E(n, k)\) зависит от того, находился ли токен `n` в пуле НО (не окупившихся) или О (окупившихся) *до* продажи `k` (т.е. на основе \(E(n, k-1)\)). Он также зависит от *количества* токенов в пуле НО до продажи `k`, поскольку это определяет долю на токен из Эксклюзивного дохода для не окупившихся.

Обозначения:
*   \(G\) = Цель окупаемости
*   \(B_k\) = Сумма Доли Покупателей от продажи \(k\)
*   \(P_\%\) = Процент Доли Не Окупившихся / 100
*   \(S_\% = 1 - P_\%\) = Процент Общей Доли / 100
*   \(НО(k)\) = Множество индексов токенов \(i < k\), где \(E(i, k-1) < G\)
*   \(О(k)\) = Множество индексов токенов \(i < k\), где \(E(i, k-1) \ge G\)
*   \(|НО(k)|\), \(|О(k)|\) = Количество токенов в каждом множестве
*   \(|Н(k)| = k-1\) = Общее количество участвующих токенов

Эксклюзивная доля на один не окупившийся токен: \( \delta_{НО}(k) = (B_k \times P_\%) / |НО(k)| \) (если \(|НО(k)| > 0\), иначе 0)
Общая доля на токен: \( \delta_О(k) = (B_k \times S_\%) / |Н(k)| \) (если \(|Н(k)| > 0\), иначе 0)

Тогда прирост для токена \(n\) от продажи \(k\) равен:
\[ \Delta E(n, k) = \begin{cases} \delta_{НО}(k) + \delta_О(k) & \text{если } n \in НО(k) \\ \delta_О(k) & \text{если } n \in О(k) \end{cases} \]

Из-за этой зависимости от состояния *всех* предыдущих токенов на *каждом* шаге, точный расчет требует пошаговой симуляции, как реализовано в калькуляторе.

## Калькулятор распределения доходов

Интерактивный калькулятор доступен в разделе "Revenue Sharing" и на странице документации. Он позволяет **моделировать накопленный доход** за указанное количество продаж, учитывая фазу предоплаты, путем **точной пошаговой симуляции**.

**Основные параметры для ввода:**
*   Сумма начальных инвестиций.
*   Цена токена (определяет Кол-во Заказчиков).
*   Настраиваемые доли Создателя, Платформы, Продвижения (применяются к продажам *после* Заказчиков).
*   Множитель окупаемости для покупателей.
*   Процент от доли покупателей, идущий в приоритетный пул "не окупившихся".
*   **Общее количество продаж** (ползунок/ввод, минимум = Кол-во Заказчиков, **максимум ограничен** для сохранения производительности калькулятора).
*   **Номер покупателя**, для которого рассчитывается накопленный доход (ползунок/ввод).

**Выходные данные:**
*   **Общий накопленный доход** для Создателя (Предоплата + Доля от последующих продаж), Платформы, Продвижения и выбранного Номера Покупателя после указанного Общего Количества Продаж.
*   Расчетное **Количество Заказчиков**.
*   **Точное количество** окупившихся токенов на конец симуляции.

**Важно:** Калькулятор выполняет **точную симуляцию** продаж шаг за шагом, отслеживая накопленный доход каждого виртуального токена. Из-за вычислительной сложности, максимальное количество продаж, которое можно симулировать в калькуляторе, ограничено (например, ~20-30 тыс.).

## Тестовые симуляции

Для детального анализа производительности модели распределения мы реализовали как браузерные, так и Node.js тесты, которые вычисляют точки окупаемости для отслеживаемых токенов. Подробную информацию о запуске этих тестов и интерпретации результатов см. в документации [Тесты Распределения Доходов](revenue-tests.md).

## Преимущества модели

1.  **Гарантия для Создателя:** Получает оплату за работу до начала широких продаж.
2.  **Предотвращение Понци:** Ранние инвесторы не получают бесконечно большую прибыль за счет поздних.
3.  **Справедливая окупаемость:** Все покупатели, включая первых Заказчиков, участвуют в распределении дохода от последующих продаж и имеют шанс окупить вложения и получить прибыль. Ранние покупатели начинают этот процесс раньше.
4.  **Устойчивость:** Модель не зависит от экспоненциального роста числа покупателей.
5.  **Прозрачность:** Четкие и понятные правила распределения.
6.  **Гибкость:** Возможность настройки долей и параметров окупаемости.

### Revenue Distribution Phase

Once the initial investment is covered by the prepaying customers (whose number is `ceil(Initial Investment / Token Price)`), subsequent sales generate revenue that is distributed among stakeholders according to configured shares (Creator, Platform, Promotion). A significant portion, the `Buyers Share` (e.g., 70%), is allocated for distribution back to token holders.

**Detailed Buyer Share Distribution:**

The distribution of the `Buyers Share` from each sale `k` (where `k` is the total number of sales so far, and `k > numPrepayers`) aims to prioritize buyers who haven't recouped their investment target (`Payback Goal = Token Price * Payback Ratio`) while still providing a smaller, ongoing return to those who have.

Here's how the `Buyers Share` from sale `k` is distributed among the previous `k-1` token holders:

1.  **Identify Pools:** Before distributing the revenue from sale `k`, all previous token holders (from #1 to #`k-1`) are categorized based on their *current* accumulated earnings compared to the `Payback Goal`:
    *   **Not Paid Back (NP) Pool:** Tokens whose earnings are *less than* the `Payback Goal`.
    *   **Paid Back (P) Pool:** Tokens whose earnings are *greater than or equal to* the `Payback Goal`.

2.  **Allocate Revenue:** The `Buyers Share` amount from sale `k` is divided based on the `Non-Payback Pool Share Percent` parameter (e.g., 60%):
    *   **Exclusive NP Revenue:** `Buyers Share Amount * (Non-Payback Pool Share Percent / 100)`. This portion is designated *exclusively* for tokens in the NP Pool.
    *   **Shared Revenue:** The remaining `Buyers Share Amount * ( (100 - Non-Payback Pool Share Percent) / 100 )`. This portion is designated for *all* participating tokens (both NP and P pools).

3.  **Calculate Per-Token Shares:**
    *   The `Exclusive NP Revenue` is divided equally among all tokens currently in the NP Pool.
    *   The `Shared Revenue` is divided equally among *all* participating tokens (i.e., #1 to #`k-1`).

4.  **Distribute Earnings:**
    *   Each token in the **NP Pool** receives: (Share from Exclusive NP Revenue) + (Share from Shared Revenue).
    *   Each token in the **P Pool** receives: (Share from Shared Revenue) only.

This ensures that tokens that haven't reached their goal receive a larger portion of the distributed revenue, accelerating their payback, while tokens that have already achieved their goal continue to receive a smaller, ongoing share.

**Recursive Nature:**

The calculation is inherently recursive or iterative. The earnings of a token `n` after sale `k`, denoted as \(E(n, k)\), depend on its earnings after the previous sale \(E(n, k-1)\) plus the increment \(\Delta E(n, k)\) received from sale `k`:

\[ E(n, k) = E(n, k-1) + \Delta E(n, k) \quad \text{for } n < k \]

The increment \(\Delta E(n, k)\) depends on whether token `n` was in the NP pool or P pool *before* sale `k` (i.e., based on \(E(n, k-1)\)). It also depends on the *number* of tokens in the NP pool before sale `k`, as this determines the per-token share from the Exclusive NP Revenue.

Let:
*   \(G\) = Payback Goal
*   \(B_k\) = Buyers Share amount from sale \(k\)
*   \(P_\%\) = Non-Payback Pool Share Percent / 100
*   \(S_\% = 1 - P_\%\)\
*   \(NP(k)\) = Set of token indices \(i < k\) where \(E(i, k-1) < G\)
*   \(P(k)\) = Set of token indices \(i < k\) where \(E(i, k-1) \ge G\)
*   \(|NP(k)|\), \(|P(k)|\) = Number of tokens in each set
*   \(|N(k)| = k-1\) = Total participating tokens

Exclusive share per NP token: \( \delta_{NP}(k) = (B_k \times P_\%) / |NP(k)| \) (if \(|NP(k)| > 0\), else 0)
Shared share per token: \( \delta_S(k) = (B_k \times S_\%) / |N(k)| \) (if \(|N(k)| > 0\), else 0)

Then, the increment for token \(n\) from sale \(k\) is:
\[ \Delta E(n, k) = \begin{cases} \delta_{NP}(k) + \delta_S(k) & \text{if } n \in NP(k) \\ \delta_S(k) & \text{if } n \in P(k) \end{cases} \]

Due to this dependency on the state of *all* previous tokens at *each* step, a precise calculation requires step-by-step simulation, as implemented in the calculator.

### Calculator Usage

The interactive revenue distribution calculator is available in the "Revenue Sharing" section and on the documentation page. It allows users to **model accumulated revenue** for a specified number of sales, taking into account the prepayment phase, using **precise step-by-step simulation**.

**Key Input Parameters:**
* Initial Investment amount
* Token Price (determines the number of Prepayers)
* Configurable shares for Creator, Platform, and Promotion (applied to sales *after* the Prepayers)
* Payback Ratio for buyers (multiplier for their investment target)
* Percentage of buyers' share directed to the priority "Not Paid Back" pool
* **Total Number of Sales** (slider/input, minimum = Number of Prepayers, **maximum limited** to maintain calculator performance)
* **Token Number** for which accumulated revenue is calculated (slider/input)

**Output Data:**
* **Total accumulated revenue** for Creator (Prepayment + Share from subsequent sales), Platform, Promotion, and the selected Token Number after the specified Total Number of Sales
* Calculated **Number of Prepayers**
* **Exact count** of tokens that have reached their payback goal by the end of the simulation

**Important Note:** The calculator performs **exact simulation** of sales step by step, tracking the accumulated revenue of each virtual token. Due to computational complexity, the maximum number of sales that can be simulated in the calculator is limited (approximately 20-30 thousand).

## Test Simulation

For detailed performance analysis of the distribution model, we've implemented both browser-based and Node.js-based test simulations that calculate payback points for tracked tokens. See the [Revenue Tests](revenue-tests.md) documentation for details on running these tests and interpreting results. 