import React, { useEffect, useRef, useState } from 'react'
import { assets, blogCategories } from '../../assets/assets'
import Quill from 'quill'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { parse } from 'marked'

const AddBlog = () => {
  const { axios } = useAppContext()
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [autoGenerating, setAutoGenerating] = useState(false)
  const [isImageGenerating, setIsImageGenerating] = useState(false)

  const [scheduleTime, setScheduleTime] = useState(localStorage.getItem("scheduleTime") || '')
  const [hasScheduled, setHasScheduled] = useState(localStorage.getItem("hasScheduled") === 'true')

  const editorRef = useRef(null)
  const quillRef = useRef(null)

  const [image, setImage] = useState(false)
  const [title, setTitle] = useState('')
  const [subTitle, setSubTitle] = useState('')
  const [category, setCategory] = useState('Startup')
  const [isPublished, setIsPublished] = useState(false)
  const [response, setResponse] = useState({})

  const generateImage = async (customSubTitle = subTitle) => {
    // if (!customSubTitle) return toast.error("SubTitle missing for image generation")
    // if (!title) return toast.error("Title missing for image generation !")
      console.log(response)
      console.log(response.parsedContent.visual_elements.featured_image.image_prompt)
      

    try {
      setIsImageGenerating(true)
      const { data } = await axios.post('https://blog-backend.cloco.com.au/api/blog/auto-generate', {
        // topic: `You are an AI Art Director responsible for creating a single, compelling thumbnail image for a blog. Your primary task is to first analyze the provided blog title and then decide on the most effective visual strategy.

        // Blog Title : "${title}"

        // ### Step 1 : Analyze the Title's Subject

        // Based on the title, determine which of the following two paths is the most appropriate visual representation.

        // ### Step 2 : Choose a Visual Path

        // PATH A : For Concrete, Tangible Subjects (If the title refers to a person, an activity, a physical location or a tangible object)

        // * Instruction : Create a highly detailed, ultra-realistic thumbnail that looks like a natural photograph taken with a DSLR camera.
        // * Key Elements : Feature rich textures, dynamic and natural lighting, realistic shadows and a clear depth of field (bokeh). If humans are included, their expressions and body language must be authentic and engaging.
        // * Style : Professional editorial photography, similar to visuals in National Geographic or TIME Magazine.

        // PATH B : For Abstract, Branded or Conceptual Subjects (If the title refers to a brand, a company, a piece of software, an abstract idea or a non-visual concept like "finance" or "strategy")

        // * Instruction : Create a visually compelling conceptual or symbolic image that represents the core idea of the title.
        // * Key Elements : This can involve creatively integrating a brand's logo into an artistic design or using powerful metaphors (e.g., glowing neural networks for 'AI', interconnected nodes for 'blockchain', a lone chess piece for 'strategy').
        // * Style : The image must still look premium and high-end. Use sleek design, cinematic lighting and a modern, minimalist aesthetic. Avoid literal or cheesy interpretations.

        // ### Step 3 : Apply Universal Rules

        // Regardless of the path chosen, the final image prompt must adhere to these rules :

        // 1. Aspect Ratio : Maintain a strict 16:9 aspect ratio.
        // 2. Context is King : The image must be both visually striking and feel like a perfect, insightful visual companion to the title.
        // 3. No Text : Do not render the title's text or any other words onto the image itself.

        // ### Final Output :
        
        // Generate the final, detailed prompt that would be sent to an image generation AI (Imagen) based on your analysis.
        // `.trim(),
        topic : response.parsedContent.visual_elements.featured_image.image_prompt
      })

      if (data.success) {
        const blob = await fetch(data.image).then(res => res.blob())
        const file = new File([blob], "generated-image.png", { type: blob.type })
        setImage(file)
        toast.success("Image generated!")
        return true
      } else {
        toast.error(data.message)
        return false
      }
    } catch (error) {
      toast.error("Image generation failed")
      toast.error(error)
      return false
    } finally {
      setIsImageGenerating(false)
    }
  }

  const generateContent = async () => {
    if (!title) return toast.error('Please enter a title !')
    try {
      setLoading(true)
      const { data } = await axios.post('https://blog-backend.cloco.com.au/api/blog/generate', {
        prompt : `
  You are an expert SEO Content Strategist and AI Blog Architect.
  Your primary task is to generate a complete, structured blog post plan in a single, valid JSON object.
  The topic for the blog post is : "${title}"
  
  Crucially, the combined total word count for all paragraphs within the 'content_structure' section MUST be between 500 and 550 words.
  The output MUST be ONLY the JSON object. Do not include any text, explanations or markdown formatting like \`\`\`json before or after the JSON itself.
  Pay extremely close attention to JSON syntax rules, especially ensuring there are NO trailing commas after the last element in any object or array.
  Adhere strictly to the following JSON structure and fill in all values with high-quality, relevant and SEO-optimized content.
  For all content fields, use well-written English and Markdown for formatting where appropriate.
  Always leave a single space gap before any "?", "!" and ":" present in the conent that is generated.
  Always remove "," before "and" or "or" when it appears in the content that is generated.
  The 'image_prompt' for the 'featured_image' is critically important : it must be highly detailed and photorealistic, suitable for a model like Imagen 3. The size of the image should always be in the aspect ratio of 16:9.
  
  Here is the required JSON structure :

    ${JSON.stringify(
    {
        metadata: {
            title: 'SEO-optimized title with primary keyword (50-60 characters)',
            meta_description: 'Compelling description with CTA (150-160 characters)',
            summary: 'Generate a three-sentence summary, with no subheading. It must immediately tell the reader what the article is about, its core argument and what they will learn.',
            url_slug: 'seo-friendly-url-slug',
            primary_keyword: 'exact primary keyword',
            secondary_keywords: ['keyword_1', 'keyword_2', 'keyword_3', 'keyword_4', 'keyword_5'],
            search_intent: 'informational/commercial/transactional',
            target_audience: 'specified audience description',
            content_type: 'guide/listicle/case-study/how-to',
            estimated_read_time: 'number in minutes',
            word_count: 'actual total word count (must be between 500-550)',
            publication_date: 'ISO 8601 timestamp',
            last_updated: 'ISO 8601 timestamp',
            author_attribution: 'AI-generated content, reviewed by experts'
        },
        seo_analysis: {
            focus_keyword_analysis: {
                primary_keyword: "Use the same keyword from metadata.primary_keyword.",
                keyword_density: "Based on the generated content, calculate the keyword density as a percentage string (e.g., '1.8 %').",
                keyword_placement: {
                    title: "Set to true if the primary keyword is in metadata.title.",
                    meta_description: "Set to true if the primary keyword is in metadata.meta_description.",
                    h1: "Set to true, as the title serves as the H1.",
                    summary: "Set to true if the primary keyword is in metadata.summary.",
                    url: "Set to true if the primary keyword is in metadata.url_slug."
                }
            },
            content_optimization: {
                readability_score: "Estimate a Flesch-Kincaid readability score for the generated content (e.g., 65).",
                reading_level: "Estimate the U.S. school grade reading level for the content.",
                sentence_length_avg: "Estimate the average sentence length in words.",
                paragraph_length_avg: "Estimate the average paragraph length in sentences.",
                passive_voice_percentage: "Estimate the percentage of passive voice used in the content (e.g., 10).",
                transition_words_count: "Estimate the total count of transition words used."
            },
            technical_seo: {
                internal_links_suggested: "Suggest a reasonable number of internal links for this content (e.g., 3).",
                external_links_suggested: "Suggest a reasonable number of external links for this content (e.g., 2).",
                images_required: "Suggest a total number of images (including featured) needed for this post (e.g., 3).",
                schema_markup_type: "Based on metadata.content_type, suggest the best Schema.org type (e.g., 'HowTo', 'Article').",
                featured_snippet_optimization: "Set to true or false based on whether the content is structured (e.g., with lists, steps or Q&A) to win a featured snippet."
            }
        },
        content_structure: {
            introduction: {
                heading: "Generate an intriguing subheading that hooks the reader.",
                paragraph: "Write a paragraph that forges an immediate connection by setting the scene or posing a relatable problem. It must frame the topic's importance in a way that resonates personally with the reader. This paragraph should be approximately 75 words."
            },
            body_content_1: {
                heading: "Generate a clear, compelling subheading for the first body section.",
                paragraph: "Write a paragraph that goes beyond stating facts. It should explore the 'why' and 'so what' of each point, using examples and analysis to give the perspective weight and substance. This paragraph should be approximately 175 words."
            },
            body_content_2: {
                heading: "Generate another clear, compelling subheading for the second body section.",
                paragraph: "Write a paragraph similar in style to the first body section. It must explore deeper implications with examples and analysis, avoiding simple repetition of facts and providing substantial insights. This paragraph should be approximately 175 words."
            },
            conclusion: {
                heading: "Generate a thought-provoking subheading for the conclusion.",
                paragraph: "Write a paragraph that summarizes the key takeaway with flair. It should leave the reader with a lingering thought, a challenging question or a sense of clarity and empowerment. This paragraph should be approximately 100 words."
            }
        },
        visual_elements: {
            featured_image: {
                image_prompt: 'Critically important : A highly detailed, ultra-realistic prompt for an AI image generator, designed to look like a natural photo taken with a DSLR and it should have realistic textures. Include real-world lighting and if there are any faces present in it, then it should be so realistic and natural.',
                alt_text: 'SEO-friendly alt text for the featured image.',
                caption: 'A brief, descriptive caption for the image.'
            }
        },
        social_optimization: {
            hashtags: ["Generate an array of 7 highly relevant and specific hashtags for social media platforms."],
            social_posts: {
                linkedin: {
                    post_text: "Write a professional and engaging post for LinkedIn based on the article's core message. It should include an insightful hook and a question to drive engagement. Use emojis where appropriate.",
                    character_count: "Calculate the character count of the generated LinkedIn post."
                },
                twitter: {
                    post_text: "Write a short, punchy and compelling post for Twitter/X. It must include 1-2 of the most important hashtags from the list above.",
                    character_count: "Calculate the character count of the generated Twitter post."
                },
                facebook: {
                    post_text: "Write a slightly longer, more descriptive post for a Facebook audience. It should summarize the value of the article and encourage sharing and discussion.",
                    character_count: "Calculate the character count of the generated Facebook post."
                },
                instagram: {
                    post_text: "Write an engaging caption for an Instagram post. It should be visually descriptive to complement the featured image. End with a strong call-to-action like 'Link in bio for the full guide !' and include 3-4 of the most relevant hashtags at the end. Use emojis to increase engagement.",
                    character_count: "Calculate the character count of the generated Instagram post."
                }
            }
        },
        performance_predictions: {
            seo_score: "As an SEO expert, estimate a total SEO score for this generated content out of 100.",
            estimated_organic_traffic: "Based on the keyword and content quality, estimate a realistic monthly organic traffic range (e.g., '800-1,500 visits').",
            keyword_ranking_probability: {
                primary_keyword: "Estimate the probability (as a percentage string) of ranking in the top 5 search results within 6 months for the primary keyword.",
                secondary_keywords: "Estimate the probability (as a percentage string) of ranking in the top 10 within 3 months for the secondary keywords."
            },
            engagement_metrics: {
                predicted_time_on_page: "Predict the average time on page for a reader (e.g., '5-7 minutes').",
                predicted_bounce_rate: "Predict the bounce rate for this page (e.g., '40-50 %').",
                predicted_conversion_rate: "If a CTA were present, predict a potential conversion rate (e.g., '2.5-4 %')."
            },
            social_sharing_potential: "Assess the social sharing potential of this content (e.g., 'High', 'Medium', 'Low') and give a brief reason.",
            backlink_potential: "Assess the potential for this content to attract natural backlinks (e.g., 'Medium-High - comprehensive resource')."
        },
        content_quality_metrics: {
            uniqueness_score: "Estimate the content's uniqueness and originality score out of 100.",
            expertise_level: "Assess the level of expertise demonstrated in the content (e.g., 'High - provides industry-specific insights').",
            actionability_score: "Rate how actionable the content is for the target audience out of 100.",
            comprehensiveness: "Describe how comprehensive the generated guide is (e.g., 'Complete implementation guide').",
            authority_signals: ["List the signals within the generated content that demonstrate authority (e.g., 'Specific data points', 'Step-by-step process')."]
        },
        optimization_suggestions: {
            content_gaps_to_address: ["Identify 3 potential content gaps or areas that could be added in a future update to make the article even better."],
            keyword_opportunities: ["Suggest 3 related long-tail keyword opportunities that could be targeted in separate, future articles."],
            content_updates_schedule: "Recommend a schedule for reviewing and updating this content (e.g., 'Review and update every 6 months').",
            performance_monitoring: ["List key metrics that should be tracked to monitor the performance of this blog post."]
        }
    },
    null,
    2
    )
    }
  `
      })
      
      if (data.success) {
  // Parse the JSON string from API
  const parsedContent = JSON.parse(data.content)

  setResponse({parsedContent})

  const cs = parsedContent.content_structure

  const htmlContent = `
    <br/>
    <br/>
    <br/>
    <h2>${cs.introduction.heading}</h2>
    <p>${cs.introduction.paragraph}</p>
        <br/>
    <br/>
    <br/>
    <h2>${cs.body_content_1.heading}</h2>
    <p>${cs.body_content_1.paragraph}</p>
        <br/>
    <br/>
    <br/>
    <h2>${cs.body_content_2.heading}</h2>
    <p>${cs.body_content_2.paragraph}</p>
        <br/>
    <br/>
    <br/>
    <h2>${cs.conclusion.heading}</h2>
    <p>${cs.conclusion.paragraph}</p>
  `

  quillRef.current.root.innerHTML = htmlContent
} else {
      toast.error(data.message)
    }
  } catch (error) {
    toast.error(error.message)
  } finally {
    setLoading(false)
  }
}
  const autoGenerateBlog = async () => {
    try {
      setAutoGenerating(true)
      
      const { data: aiTitleResponse } = await axios.post('https://blog-backend.cloco.com.au/api/blog/generate', {
        prompt: `You are an expert senior blog editor for a high-quality publication. 
        Your task is to generate a single, powerful blog title around 10 words only based on a significant yet 
        under-reported global trend, innovation or societal shift from the last 3-6 months.
        Focus on categories like technology, startups, sustainability, finance, health, sports or culture but avoid overused or generic headlines.
        The title should be specific, engaging and suitable for a long-form article. 
        It should expand on the theme, offering additional context or emotional intrigue.

        ### Title Crafting Rules

        Your generated title must be a single, self-contained sentence. It must accomplish the following without relying on a subtitle :

        * Create a story hook : It should present a compelling puzzle, reveal a hidden world or establish an intriguing paradox that makes the reader need to know more.
        * Embed the stakes : It must implicitly or explicitly suggest "why" this topic matters on a human or global scale.
        * Achieve Specificity : Avoid vague terms. The title should hint at the concrete subject of the article in a unique way.

        ### What to Avoid

        * Any title that feels incomplete without a subtitle.
        * Generic listicles (e.g., "Top 5..."), vague clickbait questions or alarmist phrasing.
        * Using buzzwords (like "AI" or "Web3") without a fresh, specific angle.
        * There should not be any full stop (.) at the end of the title.
        * Avoid titles with colons (:), e.g., "Our changing maps: Climate’s slow creep redraws human homelands", these type of titles should be avoided.
        
        Your final output must be only the blog title and nothing else. No "Blog Title :", no quotation marks, no justifications. 
      `.trim()
      })

      if (!aiTitleResponse.success) return toast.error(aiTitleResponse.message)

      const content = aiTitleResponse.content
      const titleMatch = content.match(/\*\*Blog Title:\*\*\s*(.*)/i)
      const subtitleMatch = content.match(/\*\*Subtitle:\*\*\s*(.*)/i)

      const generatedTitle = aiTitleResponse.content
      // const generatedSubTitle = subtitleMatch ? subtitleMatch[1].trim() : 'Latest Insight'

      // console.log(titleMatch)
      console.log(generatedTitle)

      setTitle(generatedTitle)
      // setSubTitle(generatedSubTitle)

      const { data  } = await axios.post('https://blog-backend.cloco.com.au/api/blog/generate', {
        prompt : `
  You are an expert SEO Content Strategist and AI Blog Architect.
  Your primary task is to generate a complete, structured blog post plan in a single, valid JSON object.
  The topic for the blog post is : "${generatedTitle}"
  
  Crucially, the combined total word count for all paragraphs within the 'content_structure' section MUST be between 500 and 550 words.
  The output MUST be ONLY the JSON object. Do not include any text, explanations or markdown formatting like \`\`\`json before or after the JSON itself.
  Pay extremely close attention to JSON syntax rules, especially ensuring there are NO trailing commas after the last element in any object or array.
  Adhere strictly to the following JSON structure and fill in all values with high-quality, relevant and SEO-optimized content.
  For all content fields, use well-written English and Markdown for formatting where appropriate.
  Always leave a single space gap before any "?", "!" and ":" present in the conent that is generated.
  Always remove "," before "and" or "or" when it appears in the content that is generated.
  The 'image_prompt' for the 'featured_image' is critically important : it must be highly detailed and photorealistic, suitable for a model like Imagen 3. The size of the image should always be in the aspect ratio of 16:9.
  
  Here is the required JSON structure :

    ${JSON.stringify(
    {
        metadata: {
            title: 'SEO-optimized title with primary keyword (50-60 characters)',
            meta_description: 'Compelling description with CTA (150-160 characters)',
            summary: 'Generate a three-sentence summary, with no subheading. It must immediately tell the reader what the article is about, its core argument and what they will learn.',
            url_slug: 'seo-friendly-url-slug',
            primary_keyword: 'exact primary keyword',
            secondary_keywords: ['keyword_1', 'keyword_2', 'keyword_3', 'keyword_4', 'keyword_5'],
            search_intent: 'informational/commercial/transactional',
            target_audience: 'specified audience description',
            content_type: 'guide/listicle/case-study/how-to',
            estimated_read_time: 'number in minutes',
            word_count: 'actual total word count (must be between 500-550)',
            publication_date: 'ISO 8601 timestamp',
            last_updated: 'ISO 8601 timestamp',
            author_attribution: 'AI-generated content, reviewed by experts'
        },
        seo_analysis: {
            focus_keyword_analysis: {
                primary_keyword: "Use the same keyword from metadata.primary_keyword.",
                keyword_density: "Based on the generated content, calculate the keyword density as a percentage string (e.g., '1.8 %').",
                keyword_placement: {
                    title: "Set to true if the primary keyword is in metadata.title.",
                    meta_description: "Set to true if the primary keyword is in metadata.meta_description.",
                    h1: "Set to true, as the title serves as the H1.",
                    summary: "Set to true if the primary keyword is in metadata.summary.",
                    url: "Set to true if the primary keyword is in metadata.url_slug."
                }
            },
            content_optimization: {
                readability_score: "Estimate a Flesch-Kincaid readability score for the generated content (e.g., 65).",
                reading_level: "Estimate the U.S. school grade reading level for the content.",
                sentence_length_avg: "Estimate the average sentence length in words.",
                paragraph_length_avg: "Estimate the average paragraph length in sentences.",
                passive_voice_percentage: "Estimate the percentage of passive voice used in the content (e.g., 10).",
                transition_words_count: "Estimate the total count of transition words used."
            },
            technical_seo: {
                internal_links_suggested: "Suggest a reasonable number of internal links for this content (e.g., 3).",
                external_links_suggested: "Suggest a reasonable number of external links for this content (e.g., 2).",
                images_required: "Suggest a total number of images (including featured) needed for this post (e.g., 3).",
                schema_markup_type: "Based on metadata.content_type, suggest the best Schema.org type (e.g., 'HowTo', 'Article').",
                featured_snippet_optimization: "Set to true or false based on whether the content is structured (e.g., with lists, steps or Q&A) to win a featured snippet."
            }
        },
        content_structure: {
            introduction: {
                heading: "Generate an intriguing subheading that hooks the reader.",
                paragraph: "Write a paragraph that forges an immediate connection by setting the scene or posing a relatable problem. It must frame the topic's importance in a way that resonates personally with the reader. This paragraph should be approximately 75 words."
            },
            body_content_1: {
                heading: "Generate a clear, compelling subheading for the first body section.",
                paragraph: "Write a paragraph that goes beyond stating facts. It should explore the 'why' and 'so what' of each point, using examples and analysis to give the perspective weight and substance. This paragraph should be approximately 175 words."
            },
            body_content_2: {
                heading: "Generate another clear, compelling subheading for the second body section.",
                paragraph: "Write a paragraph similar in style to the first body section. It must explore deeper implications with examples and analysis, avoiding simple repetition of facts and providing substantial insights. This paragraph should be approximately 175 words."
            },
            conclusion: {
                heading: "Generate a thought-provoking subheading for the conclusion.",
                paragraph: "Write a paragraph that summarizes the key takeaway with flair. It should leave the reader with a lingering thought, a challenging question or a sense of clarity and empowerment. This paragraph should be approximately 100 words."
            }
        },
        visual_elements: {
            featured_image: {
                image_prompt: 'Critically important : A highly detailed, ultra-realistic prompt for an AI image generator, designed to look like a natural photo taken with a DSLR and it should have realistic textures. Include real-world lighting and if there are any faces present in it, then it should be so realistic and natural.',
                alt_text: 'SEO-friendly alt text for the featured image.',
                caption: 'A brief, descriptive caption for the image.'
            }
        },
        social_optimization: {
            hashtags: ["Generate an array of 7 highly relevant and specific hashtags for social media platforms."],
            social_posts: {
                linkedin: {
                    post_text: "Write a professional and engaging post for LinkedIn based on the article's core message. It should include an insightful hook and a question to drive engagement. Use emojis where appropriate.",
                    character_count: "Calculate the character count of the generated LinkedIn post."
                },
                twitter: {
                    post_text: "Write a short, punchy and compelling post for Twitter/X. It must include 1-2 of the most important hashtags from the list above.",
                    character_count: "Calculate the character count of the generated Twitter post."
                },
                facebook: {
                    post_text: "Write a slightly longer, more descriptive post for a Facebook audience. It should summarize the value of the article and encourage sharing and discussion.",
                    character_count: "Calculate the character count of the generated Facebook post."
                },
                instagram: {
                    post_text: "Write an engaging caption for an Instagram post. It should be visually descriptive to complement the featured image. End with a strong call-to-action like 'Link in bio for the full guide !' and include 3-4 of the most relevant hashtags at the end. Use emojis to increase engagement.",
                    character_count: "Calculate the character count of the generated Instagram post."
                }
            }
        },
        performance_predictions: {
            seo_score: "As an SEO expert, estimate a total SEO score for this generated content out of 100.",
            estimated_organic_traffic: "Based on the keyword and content quality, estimate a realistic monthly organic traffic range (e.g., '800-1,500 visits').",
            keyword_ranking_probability: {
                primary_keyword: "Estimate the probability (as a percentage string) of ranking in the top 5 search results within 6 months for the primary keyword.",
                secondary_keywords: "Estimate the probability (as a percentage string) of ranking in the top 10 within 3 months for the secondary keywords."
            },
            engagement_metrics: {
                predicted_time_on_page: "Predict the average time on page for a reader (e.g., '5-7 minutes').",
                predicted_bounce_rate: "Predict the bounce rate for this page (e.g., '40-50 %').",
                predicted_conversion_rate: "If a CTA were present, predict a potential conversion rate (e.g., '2.5-4 %')."
            },
            social_sharing_potential: "Assess the social sharing potential of this content (e.g., 'High', 'Medium', 'Low') and give a brief reason.",
            backlink_potential: "Assess the potential for this content to attract natural backlinks (e.g., 'Medium-High - comprehensive resource')."
        },
        content_quality_metrics: {
            uniqueness_score: "Estimate the content's uniqueness and originality score out of 100.",
            expertise_level: "Assess the level of expertise demonstrated in the content (e.g., 'High - provides industry-specific insights').",
            actionability_score: "Rate how actionable the content is for the target audience out of 100.",
            comprehensiveness: "Describe how comprehensive the generated guide is (e.g., 'Complete implementation guide').",
            authority_signals: ["List the signals within the generated content that demonstrate authority (e.g., 'Specific data points', 'Step-by-step process')."]
        },
        optimization_suggestions: {
            content_gaps_to_address: ["Identify 3 potential content gaps or areas that could be added in a future update to make the article even better."],
            keyword_opportunities: ["Suggest 3 related long-tail keyword opportunities that could be targeted in separate, future articles."],
            content_updates_schedule: "Recommend a schedule for reviewing and updating this content (e.g., 'Review and update every 6 months').",
            performance_monitoring: ["List key metrics that should be tracked to monitor the performance of this blog post."]
        }
    },
    null,
    2
    )
    }
  `
      })
      
      if (data.success) {
  // Parse the JSON string from API
  const parsedContent = JSON.parse(data.content)
  setResponse({parsedContent})

  console.log(parsedContent)

  const cs = parsedContent.content_structure

  const htmlContent = `
    <br/>
    <br/>
    <h2>${cs.introduction.heading}</h2>
    <br/>
    <p>${cs.introduction.paragraph}</p>
        <br/>
    <br/>
    <h2>${cs.body_content_1.heading}</h2>
        <br/>
    <p>${cs.body_content_1.paragraph}</p>
        <br/>
    <br/>
    <h2>${cs.body_content_2.heading}</h2>
        <br/>

    <p>${cs.body_content_2.paragraph}</p>
        <br/>
    <br/>
    <h2>${cs.conclusion.heading}</h2>
        <br/>

    <p>${cs.conclusion.paragraph}</p>
  `

  quillRef.current.root.innerHTML = htmlContent
        toast.success('Blog auto-generated!')
      } else {
        toast.error(aiBlogResponse.message )
      }
      console.log("Blog generated successfully")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setAutoGenerating(false)
    }
  }

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault()
      setIsAdding(true)

      const blog = {
        title,
        subTitle,
        description: quillRef.current.root.innerHTML,
        category,
        isPublished,
      }

      const formData = new FormData()
      formData.append('blog', JSON.stringify(blog))
      formData.append('image', image)

      const { data } = await axios.post('https://blog-backend.cloco.com.au/api/blog/add', formData)

      if (data.success) {
        toast.success(data.message)
        setImage(false)
        setTitle('')
        setSubTitle('')
        quillRef.current.root.innerHTML = ''
        setCategory('Startup')
        setIsPublished(false)
        setScheduleTime('')
        setHasScheduled(false)
        localStorage.removeItem("scheduleTime")
        localStorage.removeItem("hasScheduled")
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsAdding(false)
    }
  }

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: 'snow' })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("scheduleTime", scheduleTime)
  }, [scheduleTime])

  useEffect(() => {
    localStorage.setItem("hasScheduled", hasScheduled.toString())
  }, [hasScheduled])

  useEffect(() => {
    if (!scheduleTime || hasScheduled) return

    const timer = setInterval(async () => {
      const now = new Date()
      const scheduled = new Date(scheduleTime)

      if (Math.abs(now - scheduled) < 1000) {
        setHasScheduled(true)
        toast.success("Generating scheduled blog...")

        const { data: aiTitleResponse } = await axios.post('https://blog-backend.cloco.com.au/api/blog/generate', {
          prompt: `You are an expert senior blog editor for a high-quality publication. 
          Your task is to generate a single, powerful blog title based on a significant yet 
          under-reported global trend, innovation or societal shift from the last 3-6 months.
          Focus on categories like technology, startups, sustainability, finance, health or culture but avoid overused or generic headlines.
          The title should be specific, engaging and suitable for a long-form article. 
          It should expand on the theme, offering additional context or emotional intrigue.

          ### Title Crafting Rules

          Your generated title must be a single, self-contained sentence. It must accomplish the following without relying on a subtitle :

          * Create a story hook : It should present a compelling puzzle, reveal a hidden world or establish an intriguing paradox that makes the reader need to know more.
          * Embed the stakes : It must implicitly or explicitly suggest "why" this topic matters on a human or global scale.
          * Achieve Specificity : Avoid vague terms. The title should hint at the concrete subject of the article in a unique way.

          ### What to Avoid

          * Any title that feels incomplete without a subtitle.
          * Generic listicles (e.g., "Top 5..."), vague clickbait questions or alarmist phrasing.
          * Using buzzwords (like "AI" or "Web3") without a fresh, specific angle.
          
          Your final output must be only the blog title and nothing else. No "Blog Title :", no quotation marks, no justifications. 
        `.trim()
        })

        if (!aiTitleResponse.success) return toast.error(aiTitleResponse.message)

        const content = aiTitleResponse.content
        const titleMatch = content.match(/\*\*Blog Title:\*\*\s*(.*)/i)
        const subtitleMatch = content.match(/\*\*Subtitle:\*\*\s*(.*)/i)

        // const generatedTitle = titleMatch ? titleMatch[1].trim() : 'Trending Blog'
        const generatedTitle = aiTitleResponse.content
        const generatedSubTitle = subtitleMatch ? subtitleMatch[1].trim() : 'Latest Insight'

        setTitle(generatedTitle)

        setSubTitle(generatedSubTitle)

       const { data  } = await axios.post('https://blog-backend.cloco.com.au/api/blog/generate', {
        prompt : `
  You are an expert SEO Content Strategist and AI Blog Architect.
  Your primary task is to generate a complete, structured blog post plan in a single, valid JSON object.
  The topic for the blog post is : "${generatedTitle}"
  
  Crucially, the combined total word count for all paragraphs within the 'content_structure' section MUST be between 500 and 550 words.
  The output MUST be ONLY the JSON object. Do not include any text, explanations or markdown formatting like \`\`\`json before or after the JSON itself.
  Pay extremely close attention to JSON syntax rules, especially ensuring there are NO trailing commas after the last element in any object or array.
  Adhere strictly to the following JSON structure and fill in all values with high-quality, relevant and SEO-optimized content.
  For all content fields, use well-written English and Markdown for formatting where appropriate.
  Always leave a single space gap before any "?", "!" and ":" present in the conent that is generated.
  Always remove "," before "and" or "or" when it appears in the content that is generated.
  The 'image_prompt' for the 'featured_image' is critically important : it must be highly detailed and photorealistic, suitable for a model like Imagen 3. The size of the image should always be in the aspect ratio of 16:9.
  
  Here is the required JSON structure :

    ${JSON.stringify(
    {
        metadata: {
            title: 'SEO-optimized title with primary keyword (50-60 characters)',
            meta_description: 'Compelling description with CTA (150-160 characters)',
            summary: 'Generate a three-sentence summary, with no subheading. It must immediately tell the reader what the article is about, its core argument and what they will learn.',
            url_slug: 'seo-friendly-url-slug',
            primary_keyword: 'exact primary keyword',
            secondary_keywords: ['keyword_1', 'keyword_2', 'keyword_3', 'keyword_4', 'keyword_5'],
            search_intent: 'informational/commercial/transactional',
            target_audience: 'specified audience description',
            content_type: 'guide/listicle/case-study/how-to',
            estimated_read_time: 'number in minutes',
            word_count: 'actual total word count (must be between 500-550)',
            publication_date: 'ISO 8601 timestamp',
            last_updated: 'ISO 8601 timestamp',
            author_attribution: 'AI-generated content, reviewed by experts'
        },
        seo_analysis: {
            focus_keyword_analysis: {
                primary_keyword: "Use the same keyword from metadata.primary_keyword.",
                keyword_density: "Based on the generated content, calculate the keyword density as a percentage string (e.g., '1.8 %').",
                keyword_placement: {
                    title: "Set to true if the primary keyword is in metadata.title.",
                    meta_description: "Set to true if the primary keyword is in metadata.meta_description.",
                    h1: "Set to true, as the title serves as the H1.",
                    summary: "Set to true if the primary keyword is in metadata.summary.",
                    url: "Set to true if the primary keyword is in metadata.url_slug."
                }
            },
            content_optimization: {
                readability_score: "Estimate a Flesch-Kincaid readability score for the generated content (e.g., 65).",
                reading_level: "Estimate the U.S. school grade reading level for the content.",
                sentence_length_avg: "Estimate the average sentence length in words.",
                paragraph_length_avg: "Estimate the average paragraph length in sentences.",
                passive_voice_percentage: "Estimate the percentage of passive voice used in the content (e.g., 10).",
                transition_words_count: "Estimate the total count of transition words used."
            },
            technical_seo: {
                internal_links_suggested: "Suggest a reasonable number of internal links for this content (e.g., 3).",
                external_links_suggested: "Suggest a reasonable number of external links for this content (e.g., 2).",
                images_required: "Suggest a total number of images (including featured) needed for this post (e.g., 3).",
                schema_markup_type: "Based on metadata.content_type, suggest the best Schema.org type (e.g., 'HowTo', 'Article').",
                featured_snippet_optimization: "Set to true or false based on whether the content is structured (e.g., with lists, steps or Q&A) to win a featured snippet."
            }
        },
        content_structure: {
            introduction: {
                heading: "Generate an intriguing subheading that hooks the reader.",
                paragraph: "Write a paragraph that forges an immediate connection by setting the scene or posing a relatable problem. It must frame the topic's importance in a way that resonates personally with the reader. This paragraph should be approximately 75 words."
            },
            body_content_1: {
                heading: "Generate a clear, compelling subheading for the first body section.",
                paragraph: "Write a paragraph that goes beyond stating facts. It should explore the 'why' and 'so what' of each point, using examples and analysis to give the perspective weight and substance. This paragraph should be approximately 175 words."
            },
            body_content_2: {
                heading: "Generate another clear, compelling subheading for the second body section.",
                paragraph: "Write a paragraph similar in style to the first body section. It must explore deeper implications with examples and analysis, avoiding simple repetition of facts and providing substantial insights. This paragraph should be approximately 175 words."
            },
            conclusion: {
                heading: "Generate a thought-provoking subheading for the conclusion.",
                paragraph: "Write a paragraph that summarizes the key takeaway with flair. It should leave the reader with a lingering thought, a challenging question or a sense of clarity and empowerment. This paragraph should be approximately 100 words."
            }
        },
        visual_elements: {
            featured_image: {
                image_prompt: 'Critically important : A highly detailed, ultra-realistic prompt for an AI image generator, designed to look like a natural photo taken with a DSLR and it should have realistic textures. Include real-world lighting and if there are any faces present in it, then it should be so realistic and natural.',
                alt_text: 'SEO-friendly alt text for the featured image.',
                caption: 'A brief, descriptive caption for the image.'
            }
        },
        social_optimization: {
            hashtags: ["Generate an array of 7 highly relevant and specific hashtags for social media platforms."],
            social_posts: {
                linkedin: {
                    post_text: "Write a professional and engaging post for LinkedIn based on the article's core message. It should include an insightful hook and a question to drive engagement. Use emojis where appropriate.",
                    character_count: "Calculate the character count of the generated LinkedIn post."
                },
                twitter: {
                    post_text: "Write a short, punchy and compelling post for Twitter/X. It must include 1-2 of the most important hashtags from the list above.",
                    character_count: "Calculate the character count of the generated Twitter post."
                },
                facebook: {
                    post_text: "Write a slightly longer, more descriptive post for a Facebook audience. It should summarize the value of the article and encourage sharing and discussion.",
                    character_count: "Calculate the character count of the generated Facebook post."
                },
                instagram: {
                    post_text: "Write an engaging caption for an Instagram post. It should be visually descriptive to complement the featured image. End with a strong call-to-action like 'Link in bio for the full guide !' and include 3-4 of the most relevant hashtags at the end. Use emojis to increase engagement.",
                    character_count: "Calculate the character count of the generated Instagram post."
                }
            }
        },
        performance_predictions: {
            seo_score: "As an SEO expert, estimate a total SEO score for this generated content out of 100.",
            estimated_organic_traffic: "Based on the keyword and content quality, estimate a realistic monthly organic traffic range (e.g., '800-1,500 visits').",
            keyword_ranking_probability: {
                primary_keyword: "Estimate the probability (as a percentage string) of ranking in the top 5 search results within 6 months for the primary keyword.",
                secondary_keywords: "Estimate the probability (as a percentage string) of ranking in the top 10 within 3 months for the secondary keywords."
            },
            engagement_metrics: {
                predicted_time_on_page: "Predict the average time on page for a reader (e.g., '5-7 minutes').",
                predicted_bounce_rate: "Predict the bounce rate for this page (e.g., '40-50 %').",
                predicted_conversion_rate: "If a CTA were present, predict a potential conversion rate (e.g., '2.5-4 %')."
            },
            social_sharing_potential: "Assess the social sharing potential of this content (e.g., 'High', 'Medium', 'Low') and give a brief reason.",
            backlink_potential: "Assess the potential for this content to attract natural backlinks (e.g., 'Medium-High - comprehensive resource')."
        },
        content_quality_metrics: {
            uniqueness_score: "Estimate the content's uniqueness and originality score out of 100.",
            expertise_level: "Assess the level of expertise demonstrated in the content (e.g., 'High - provides industry-specific insights').",
            actionability_score: "Rate how actionable the content is for the target audience out of 100.",
            comprehensiveness: "Describe how comprehensive the generated guide is (e.g., 'Complete implementation guide').",
            authority_signals: ["List the signals within the generated content that demonstrate authority (e.g., 'Specific data points', 'Step-by-step process')."]
        },
        optimization_suggestions: {
            content_gaps_to_address: ["Identify 3 potential content gaps or areas that could be added in a future update to make the article even better."],
            keyword_opportunities: ["Suggest 3 related long-tail keyword opportunities that could be targeted in separate, future articles."],
            content_updates_schedule: "Recommend a schedule for reviewing and updating this content (e.g., 'Review and update every 6 months').",
            performance_monitoring: ["List key metrics that should be tracked to monitor the performance of this blog post."]
        }
    },
    null,
    2
    )
    }
  `
      })
      
      if (data.success) {
  // Parse the JSON string from API
  const parsedContent = JSON.parse(data.content)
  setResponse({parsedContent})

  console.log(parsedContent)

  const cs = parsedContent.content_structure

  const htmlContent = `
    <br/>
    <br/>
    <h2>${cs.introduction.heading}</h2>
    <br/>
    <p>${cs.introduction.paragraph}</p>
        <br/>
    <br/>
    <h2>${cs.body_content_1.heading}</h2>
        <br/>
    <p>${cs.body_content_1.paragraph}</p>
        <br/>
    <br/>
    <h2>${cs.body_content_2.heading}</h2>
        <br/>

    <p>${cs.body_content_2.paragraph}</p>
        <br/>
    <br/>
    <h2>${cs.conclusion.heading}</h2>
        <br/>

    <p>${cs.conclusion.paragraph}</p>
  `

  quillRef.current.root.innerHTML = htmlContent
        

        // if (!aiBlogResponse.success) return toast.error(aiBlogResponse.message)

        // quillRef.current.root.innerHTML = parse(aiBlogResponse.content)

        const success = await generateImage()
        if (!success) return

        setCategory('Technology')
              setTitle(generatedTitle)

        setIsPublished(true)
        
        setTimeout(() => {
          document.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
        }, 500)

        clearInterval(timer)
      }
    }
    }, 1000)

    return () => clearInterval(timer)
  }, [scheduleTime, hasScheduled])

  return (
    <form onSubmit={onSubmitHandler} className="flex-1 bg-blue-50/50 text-gray-600 h-full overflow-scroll">
      <div className="bg-white w-full max-w-3xl p-4 md:p-10 sm:m-10 shadow rounded">

        <p className="mb-1">Thumbnail</p>
        <div className="flex items-center gap-4">
          <label htmlFor="image">
            <img
              src={!image ? assets.upload_area : "http://localhost:3000/generated/generated_image.png"}
              className="h-16 rounded cursor-pointer"
              alt="thumbnail"
            />
            <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
          </label>

          <button
            type="button"
            onClick={generateImage}
            disabled={isImageGenerating}
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded"
          >
            {isImageGenerating ? "Generating ..." : "Generate Image"}
          </button>
        </div>

        <p className="mt-4">Title</p>
        <input
          type="text"
          placeholder="Type here"
          required
          className="w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />

        {/* <p className="mt-4">Sub title</p> */}
        {/* <input
          type="text"
          placeholder="Type here"
          required
          className="w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded"
          onChange={(e) => setSubTitle(e.target.value)}
          value={subTitle}
        /> */}

        <div className="flex gap-4 mt-4">
          <button type="button" onClick={generateContent} disabled={loading} className="text-xs bg-black text-white px-4 py-1.5 rounded">
            Generate With AI
          </button>
          <button type="button" onClick={autoGenerateBlog} disabled={autoGenerating} className="text-xs bg-green-600 text-white px-4 py-1.5 rounded">
            {autoGenerating ? 'Generating ...' : 'Auto Generate Blog'}
          </button>
        </div>

        <p className="mt-4">Schedule Publish Time</p>
        <input
          type="datetime-local"
          className="mt-2 p-2 border border-gray-300 rounded"
          onChange={(e) => setScheduleTime(e.target.value)}
          value={scheduleTime}
        />

        <div className="flex gap-4 mt-2">


  <button
    type="button"
    onClick={() => {
      setScheduleTime('');
      setHasScheduled(false);
      localStorage.removeItem('scheduledBlogTime');
      toast.success("Schedule cancelled");
    }}
    className="text-xs bg-red-600 text-white px-3 py-1.5 rounded"
  >
    Cancel Schedule
  </button>
</div>


        <p className="mt-4">Blog Description</p>
        <div className="max-w-lg h-74 pb-16 sm:pb-10 pt-2 relative">
          <div ref={editorRef}></div>
          {loading && (
            <div className="absolute right-0 top-0 bottom-0 left-0 flex items-center justify-center bg-black/10 mt-2">
              <div className="w-8 h-8 rounded-full border-2 border-t-white animate-spin"></div>
            </div>
          )}
        </div>

        <p className="mt-4">Blog category</p>
        <select
          onChange={(e) => setCategory(e.target.value)}
          name="category"
          className="mt-2 px-3 py-2 border text-gray-500 border-gray-300 outline-none rounded"
        >
          <option value="">Select category</option>
          {blogCategories.map((item, index) => (
            <option key={index} value={item}>{item}</option>
          ))}
        </select>

        <div className="flex gap-2 mt-4">
          <p>Publish now</p>
          <input
            type="checkbox"
            checked={isPublished}
            className="scale-125 cursor-pointer"
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </div>

        <button disabled={isAdding} type="submit" className="mt-8 w-40 h-10 bg-primary text-white rounded cursor-pointer text-sm">
          {isAdding ? 'Adding...' : 'Add Blog'}
        </button>
      </div>
    </form>
  )
}

export default AddBlog