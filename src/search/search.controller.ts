import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { AuthGuard } from '@nestjs/passport';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultDto } from './dto/search-result.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Поиск')
@Controller('v1/search')
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Полнотекстовый поиск по контенту социальной сети',
    description: `
    Производит поиск по постам, комментариям и пользователям.
    Поиск учитывает морфологию русского языка (стемминг, стоп-слова).
    Поддерживает поиск с опечатками (нечеткий поиск).
    Результаты возвращаются в порядке релевантности.
    `,
  })
  @ApiQuery({
    name: 'q',
    type: String,
    required: true,
    description: 'Поисковый запрос (ключевые слова)',
  })
  @ApiQuery({
    name: 'from',
    type: Number,
    required: false,
    description: 'Начальная позиция для пагинации (по умолчанию 0)',
  })
  @ApiQuery({
    name: 'size',
    type: Number,
    required: false,
    description: 'Количество результатов на странице (по умолчанию 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Результаты поиска успешно получены',
    type: SearchResultDto,
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiResponse({
    status: 400,
    description: 'Неверный формат запроса',
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка сервера или отсутствие соединения с Elasticsearch',
  })
  async search(@Query() query: SearchQueryDto): Promise<SearchResultDto> {
    return this.searchService.search(query.q, query.from, query.size);
  }
}
