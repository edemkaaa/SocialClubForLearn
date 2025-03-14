import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO для представления одного найденного элемента
 */
export class SearchHitDto {
  @ApiProperty({ 
    description: 'Название индекса', 
    example: 'Posts',
    enum: ['posts', 'comments', 'users']
  })
  index: string;

  @ApiProperty({ 
    description: 'Идентификатор документа',
    example: '42' 
  })
  id: string;

  @ApiProperty({ 
    description: 'Оценка релевантности запросу (чем выше, тем более релевантный результат)',
    example: 1.24
  })
  score: number;

  @ApiProperty({ 
    description: 'Оригинальные данные документа',
    example: {
      id: 42,
      title: 'Привет мир!',
      content: 'Это тестовый пост',
      authorId: 1,
      authorName: 'Иван Иванов',
      createdAt: '2025-03-10T12:00:00Z',
    }
  })
  source: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Подсвеченные части документа с найденными ключевыми словами', 
    example: {
      title: ['Привет <em>мир</em>!'],
      content: ['Это тестовый <em>пост</em>']
    }
  })
  highlight?: Record<string, string[]>;
}

/**
 * DTO для представления результатов поиска
 */
export class SearchResultDto {
  @ApiProperty({ 
    description: 'Общее количество найденных элементов',
    example: { value: 42, relation: 'eq' }
  })
  total: {
    value: number;
    relation: string;
  };

  @ApiProperty({ 
    description: 'Найденные документы',
    type: [SearchHitDto]
  })
  hits: SearchHitDto[];
} 