# XRpage
## README

### Описание проекта

Этот проект демонстрирует пример использования WebXR с A-Frame для создания 360-градусного видео с поддержкой виртуальной реальности (VR). Пользователь может воспроизводить/пауза видео и входить в режим VR, если его устройство поддерживает эту функцию.

### Структура проекта

Проект включает следующие основные компоненты:

1. **HTML**: Основной файл разметки.
2. **CSS**: Стили для кнопок управления.

### Основные компоненты

#### HTML

```<!DOCTYPE html>
<html>

<head>
    <title>WebXR with A-Frame</title>
    <meta name="description" content="WebXR Example with A-Frame">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <meta name="mobile-web-app-capable" content="yes">
    <!-- <link rel='stylesheet' href='VRpage.css'> -->
    <script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>

    <style>
        #playPauseButton {
            position: absolute;
            top: 10px;
            z-index: 1000;
            padding: 10px;
            background-color: white;
            border: 1px solid black;
            cursor: pointer;
        }

        #playPauseButton {
            left: 10px;
        }
    </style>
</head>

<body>
    <a-scene>
        <button id="playPauseButton">Play/Pause Video</button>

        <a-assets>
            <video id="video" src="great-barrier-reef-preview.mp4" autoplay loop="true" crossorigin="anonymous"></video>
        </a-assets>

        <a-videosphere src="#video" rotation="0 -90 0"></a-videosphere>

        <a-entity camera look-controls>
            <a-cursor></a-cursor>
        </a-entity>


        <script>
            document.addEventListener('DOMContentLoaded', () => {
                const video = document.getElementById('video');
                const playPauseButton = document.getElementById('playPauseButton');

                playPauseButton.addEventListener('click', () => {
                    if (video.paused) {
                        video.play();
                    } else {
                        video.pause();
                    }
                });
            });
        </script>

</body>

</html>
```

Этот файл содержит основную структуру сцены A-Frame, включая видео сферу, камеру и пользовательский интерфейс с кнопками для управления видео и входа в VR режим.

#### CSS

Файл `VRpage.css` используется для стилей кнопок и их позиционирования.

```css
#playPauseButton {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
    padding: 10px;
    background-color: white;
    border: 1px solid black;
    cursor: pointer;
}

#xrButton {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
    padding: 10px;
    background-color: white;
    border: 1px solid black;
    cursor: pointer;
}
```
