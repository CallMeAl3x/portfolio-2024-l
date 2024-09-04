import json
import os

# Utiliser un chemin relatif et le convertir en chemin absolu
file_path = os.path.abspath(os.path.join('public', 'fonts', 'Magilio', 'Magilio_Regular.json'))

try:
    # Essayer de lire le fichier avec différents encodages
    for encoding in ['utf-8', 'utf-8-sig', 'latin-1']:
        try:
            with open(file_path, 'r', encoding=encoding) as file:
                font_data = json.load(file)
            break
        except UnicodeDecodeError:
            continue
    else:
        raise ValueError("Impossible de décoder le fichier avec les encodages essayés.")

    # Facteur d'augmentation de l'espacement horizontal
    spacing_factor = 1

    # Facteur d'augmentation de la hauteur de ligne
    line_height_factor = 1

    # Modifier l'espacement horizontal pour chaque glyphe
    if 'glyphs' in font_data:
        for glyph, data in font_data['glyphs'].items():
            if 'ha' in data:
                data['ha'] = int(data['ha'] * spacing_factor)

    # Ajuster les propriétés qui affectent la hauteur de ligne
    if 'ascender' in font_data:
        font_data['ascender'] = int(font_data['ascender'] * line_height_factor)
    if 'descender' in font_data:
        font_data['descender'] = int(font_data['descender'] * line_height_factor)
    if 'boundingBox' in font_data:
        if 'yMin' in font_data['boundingBox']:
            font_data['boundingBox']['yMin'] = int(font_data['boundingBox']['yMin'] * line_height_factor)
        if 'yMax' in font_data['boundingBox']:
            font_data['boundingBox']['yMax'] = int(font_data['boundingBox']['yMax'] * line_height_factor)

    # Sauvegarder le fichier JSON modifié
    output_path = os.path.join(os.path.dirname(file_path), 'Magilio_Regular_Spaced_Lined.json')
    with open(output_path, 'w', encoding='utf-8') as file:
        json.dump(font_data, file, indent=2, ensure_ascii=False)

    print(f"Fichier de police modifié avec succès. Sauvegardé sous : {output_path}")

except Exception as e:
    print(f"Une erreur s'est produite : {e}")
    print(f"Chemin du fichier tenté : {file_path}")