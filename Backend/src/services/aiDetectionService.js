/**
 * Servicio de Detección de Imágenes Generadas por IA
 * Utiliza múltiples métodos para máxima precisión
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

class AIDetectionService {
  /**
   * Detectar si una imagen fue generada con IA usando Hugging Face API
   * @param {string} imagePath - Ruta local de la imagen
   * @param {string} imageUrl - URL de la imagen (opcional)
   * @returns {Promise<Object>} Resultado de detección
   */
  static async detectWithHuggingFace(imagePath, imageUrl = null) {
    try {
      const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

      if (!HF_API_KEY) {
        console.warn('HUGGINGFACE_API_KEY not configured. Skipping Hugging Face detection.');
        return null;
      }

      // Leer imagen como buffer
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Opciones de modelos a usar
      const models = [
        'umm-maybe/AI-image-detector', // Detector especializado en AI
      ];

      const results = [];

      for (const model of models) {
        try {
          const response = await axios.post(
            `https://api-inference.huggingface.co/models/${model}`,
            imageBuffer,
            {
              headers: {
                Authorization: `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/octet-stream',
              },
              timeout: 30000,
            }
          );

          // Procesar respuesta según el modelo
          const result = this.processHuggingFaceResponse(response.data, model);
          if (result) {
            results.push(result);
          }
        } catch (error) {
          console.error(`Error with Hugging Face model ${model}:`, error.message);
        }
      }

      if (results.length === 0) {
        return null;
      }

      // Calcular resultado combinado
      const avgConfidence =
        results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
      const isAI = results.some((r) => r.isAI); // Si alguno detecta IA

      return {
        method: 'huggingface',
        isAI,
        confidence: Math.round(avgConfidence),
        models: results,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Hugging Face detection error:', error.message);
      return null;
    }
  }

  /**
   * Procesar respuesta de Hugging Face
   */
  static processHuggingFaceResponse(responseData, model) {
    try {
      // El modelo retorna probabilidades
      if (Array.isArray(responseData)) {
        // Buscar clase 'ai' o 'fake'
        const aiClass = responseData.find(
          (item) =>
            item.label?.toLowerCase().includes('ai') ||
            item.label?.toLowerCase().includes('fake') ||
            item.label?.toLowerCase().includes('generated')
        );

        if (aiClass) {
          return {
            model,
            isAI: aiClass.score > 0.5,
            confidence: Math.round(aiClass.score * 100),
            label: aiClass.label,
          };
        }

        // Si no encuentra clase específica, usar la puntuación más alta
        const highest = responseData.reduce((prev, current) =>
          prev.score > current.score ? prev : current
        );

        return {
          model,
          isAI: highest.label?.toLowerCase().includes('ai'),
          confidence: Math.round(highest.score * 100),
          label: highest.label,
        };
      }

      return null;
    } catch (error) {
      console.error('Error processing Hugging Face response:', error);
      return null;
    }
  }

  /**
   * Detectar metadata de IA en la imagen
   */
  static async detectAIMetadata(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();

      // Buscar indicadores de software generador
      const aiIndicators = [
        'dall-e',
        'midjourney',
        'stable',
        'diffusion',
        'adobe',
        'firefly',
        'descript',
        'gencraft',
        'artbreeder',
        'dreamstudio',
      ];

      let foundIndicators = [];
      const exifData = metadata.exif || {};

      // Revisar en software field y otros metadatos
      const allMetadata = JSON.stringify(metadata).toLowerCase();

      aiIndicators.forEach((indicator) => {
        if (allMetadata.includes(indicator)) {
          foundIndicators.push(indicator);
        }
      });

      return {
        hasAIIndicators: foundIndicators.length > 0,
        indicators: foundIndicators,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          hasAlpha: metadata.hasAlpha,
          density: metadata.density,
        },
      };
    } catch (error) {
      console.error('Metadata detection error:', error.message);
      return null;
    }
  }

  /**
   * Detector manual basado en características visuales (simple)
   * Nota: Este es un detector básico, no reemplaza ML
   */
  static async detectByImageCharacteristics(imagePath) {
    try {
      const image = await sharp(imagePath);
      const metadata = await image.metadata();
      const stats = await image.stats();

      // Análisis simple de características
      let aiScore = 0;
      const indicators = [];

      // 1. Verificar si hay interpolación (típico de IA en ciertos casos)
      if (stats.entropy > 7.5) {
        aiScore += 10;
        indicators.push('high_entropy');
      }

      // 2. Verificar patrón de canales
      const avgR = stats.channels[0].mean;
      const avgG = stats.channels[1].mean;
      const avgB = stats.channels[2].mean;
      const channelVariance =
        Math.abs(avgR - avgG) + Math.abs(avgG - avgB) + Math.abs(avgB - avgR);

      if (channelVariance < 5) {
        aiScore += 5;
        indicators.push('balanced_channels');
      }

      // 3. Resolución perfecta (muchas IA generan en resoluciones estándar)
      if (
        (metadata.width === 512 ||
          metadata.width === 768 ||
          metadata.width === 1024) &&
        (metadata.height === 512 ||
          metadata.height === 768 ||
          metadata.height === 1024)
      ) {
        aiScore += 15;
        indicators.push('standard_ai_resolution');
      }

      // Este método solo proporciona pistas, no definición
      return {
        confidence: Math.min(aiScore, 30), // Máximo 30% de confianza
        indicators,
        isReliable: aiScore > 20,
      };
    } catch (error) {
      console.error('Image characteristics detection error:', error.message);
      return null;
    }
  }

  /**
   * Ejecutar todos los métodos de detección
   */
  static async analyzeImage(imagePath, imageUrl = null) {
    const results = {
      methods: [],
      overallIsAI: false,
      overallConfidence: 0,
      timestamp: new Date(),
    };

    // 1. Metadata detection
    const metadataResult = await this.detectAIMetadata(imagePath);
    if (metadataResult) {
      results.metadata = metadataResult;
      if (metadataResult.hasAIIndicators) {
        results.methods.push({
          method: 'metadata',
          isAI: true,
          confidence: 60,
          details: metadataResult.indicators,
        });
      }
    }

    // 2. Hugging Face detection (el más importante)
    const hfResult = await this.detectWithHuggingFace(imagePath, imageUrl);
    if (hfResult) {
      results.methods.push({
        method: hfResult.method,
        isAI: hfResult.isAI,
        confidence: hfResult.confidence,
        models: hfResult.models,
      });
    }

    // 3. Visual characteristics (menos confiable pero rápido)
    const charResult = await this.detectByImageCharacteristics(imagePath);
    if (charResult && charResult.isReliable) {
      results.methods.push({
        method: 'characteristics',
        isAI: charResult.confidence > 15,
        confidence: charResult.confidence,
        indicators: charResult.indicators,
      });
    }

    // Calcular resultado final
    if (results.methods.length > 0) {
      const aiDetections = results.methods.filter((m) => m.isAI).length;
      const totalMethods = results.methods.length;

      // Usa Hugging Face como el más importante (si está disponible)
      const hfMethod = results.methods.find((m) => m.method === 'huggingface');
      if (hfMethod) {
        results.overallIsAI = hfMethod.isAI;
        results.overallConfidence = hfMethod.confidence;
      } else {
        // Si no hay HuggingFace, usar promedio
        results.overallConfidence =
          results.methods.reduce((sum, m) => sum + m.confidence, 0) /
          totalMethods;
        results.overallIsAI =
          aiDetections > totalMethods / 2 ||
          results.overallConfidence > 50;
      }
    }

    return results;
  }
}

export default AIDetectionService;
