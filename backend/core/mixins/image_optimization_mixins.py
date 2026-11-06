# Serializer Image Optimization Mixin
import os
import logging
from django.conf import settings
from PIL import Image
from io import BytesIO

logger = logging.getLogger(__name__)

MAX_WIDTH = 1920
TARGET_MIN_KB = 200
TARGET_MAX_KB = 400


class OptimizedImageSerializerMixin:
    """
    Optimizes images on-request with disk caching:
    - Converts all images to WebP
    - Resizes to max 1920px width (preserves aspect ratio)
    - Targets 200-400KB output via binary search
    - Disk-cached: first request optimizes, repeat requests instant
    - Cache invalidated when original file is modified
    - Falls back to original on any error
    """

    def get_optimized_image_url(self, obj, field_name):
        image_field = getattr(obj, field_name, None)
        if not image_field:
            return None

        try:
            request = self.context.get('request')
            if not request:
                return image_field.url

            image_url = image_field.url
            image_name = os.path.splitext(
                os.path.basename(image_field.name)
            )[0]

            # Skip video and vector SVG files (serve as original)
            image_name_lower = image_field.name.lower()
            if any(image_name_lower.endswith(ext) for ext in ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.svg']):
                return request.build_absolute_uri(image_url)

            # Resolve local path (skip for remote/S3 storage)
            try:
                image_path = image_field.path
                if not os.path.exists(image_path):
                    return request.build_absolute_uri(image_url)
            except (AttributeError, ValueError):
                return request.build_absolute_uri(image_url)

            # Always serve as WebP
            temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
            os.makedirs(temp_dir, exist_ok=True)

            temp_filename = f"{obj.id}_{image_name}_optimized.webp"
            temp_path = os.path.join(temp_dir, temp_filename)

            # Fast cache check
            if os.path.exists(temp_path):
                if os.path.getmtime(temp_path) >= os.path.getmtime(image_path):
                    return request.build_absolute_uri(
                        f"/media/temp/{temp_filename}"
                    )

            # Open and process image
            with Image.open(image_path) as img:
                # Convert to RGB (required for WebP)
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGBA')
                    background = Image.new('RGB', img.size, (0, 0, 0))
                    if img.mode == 'RGBA':
                        background.paste(img, mask=img.split()[3])
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')

                # Resize if wider than MAX_WIDTH
                if img.width > MAX_WIDTH:
                    ratio = MAX_WIDTH / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize(
                        (MAX_WIDTH, new_height),
                        Image.LANCZOS
                    )

                # Binary search for quality targeting 200-400KB
                quality_min, quality_max = 10, 95
                best_buffer = None
                best_quality = 75  # fallback quality

                while quality_min <= quality_max:
                    quality_mid = (quality_min + quality_max) // 2
                    buffer = BytesIO()
                    img.save(
                        buffer,
                        format='WEBP',
                        quality=quality_mid,
                        optimize=True,
                        method=4
                    )
                    size_kb = buffer.tell() / 1024

                    if TARGET_MIN_KB <= size_kb <= TARGET_MAX_KB:
                        best_buffer = buffer
                        best_quality = quality_mid
                        break
                    elif size_kb < TARGET_MIN_KB:
                        quality_min = quality_mid + 1
                    else:
                        quality_max = quality_mid - 1

                # If binary search did not hit target range,
                # use quality 75 as safe fallback
                if best_buffer is None:
                    buffer = BytesIO()
                    img.save(
                        buffer,
                        format='WEBP',
                        quality=75,
                        optimize=True,
                        method=4
                    )
                    best_buffer = buffer

                best_buffer.seek(0)
                with open(temp_path, 'wb') as f:
                    f.write(best_buffer.getvalue())

                final_size = os.path.getsize(temp_path) / 1024
                logger.info(
                    f"Optimized {image_name}: "
                    f"{os.path.getsize(image_path)/1024:.1f}KB → "
                    f"{final_size:.1f}KB (q={best_quality}, webp)"
                )

                return request.build_absolute_uri(
                    f"/media/temp/{temp_filename}"
                )

        except Exception as e:
            logger.error(
                f"Optimization error [{field_name}] "
                f"{obj.__class__.__name__} "
                f"#{getattr(obj, 'id', '?')}: {e}"
            )

        # Final fallback — return original
        try:
            request = self.context.get('request')
            return (
                request.build_absolute_uri(image_field.url)
                if request
                else image_field.url
            )
        except Exception:
            return None
