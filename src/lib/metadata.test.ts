// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { previewHTML } from '../../api/metadata'
describe('server-rendered sharing metadata', () => {
  it('escapes untrusted title and overview and includes canonical and image tags', () => {
    const html = previewHTML({ title: '<script>alert(1)</script>', description: 'A "quote" & B', image: 'https://image.tmdb.org/example.jpg', url: 'https://hovie.vercel.app/movie/42', type:'movie' })
    expect(html).not.toContain('<script>'); expect(html).toContain('&lt;script&gt;'); expect(html).toContain('A &quot;quote&quot; &amp; B'); expect(html).toContain('property="og:image"'); expect(html).toContain('rel="canonical"'); expect(html).toContain('video.movie')
  })
})
